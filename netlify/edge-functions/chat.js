export default async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const { messages, model } = await request.json();

    const groqKey = (typeof Deno !== "undefined" && Deno.env ? Deno.env.get("GROQ_API_KEY") : null) || (typeof process !== "undefined" && process.env ? process.env.GROQ_API_KEY : null);
    const cerebrasKey = (typeof Deno !== "undefined" && Deno.env ? Deno.env.get("CEREBRAS_API_KEY") : null) || (typeof process !== "undefined" && process.env ? process.env.CEREBRAS_API_KEY : null);

    if (!groqKey && !cerebrasKey) {
      return new Response(JSON.stringify({ error: "Missing API key configuration: Neither GROQ_API_KEY nor CEREBRAS_API_KEY is configured in the environment." }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    if (model) {
      // Custom model routing (e.g. vision OCR/PDF text extraction)
      let url = "https://api.groq.com/openai/v1/chat/completions";
      let auth = `Bearer ${groqKey}`;

      if (model.includes("cerebras") || model.startsWith("llama3.1-") || model.startsWith("qwen-3-") || model.startsWith("gpt-oss-")) {
        if (!cerebrasKey) {
          return new Response(JSON.stringify({ error: "Cerebras API key is not configured in the environment." }), {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          });
        }
        url = "https://api.cerebras.ai/v1/chat/completions";
        auth = `Bearer ${cerebrasKey}`;
      } else {
        if (!groqKey) {
          return new Response(JSON.stringify({ error: "Groq API key is not configured in the environment." }), {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          });
        }
      }

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": auth,
          },
          body: JSON.stringify({
            model,
            messages,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}. Details: ${errText}`);
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (err) {
        console.error(`Netlify custom model call failed: ${model} failed: ${err.message || err}`);
        return new Response(JSON.stringify({ error: `Custom model call failed: ${err.message || err}` }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }
    }

    const userMessage = messages[messages.length - 1]?.content || "";
    const q = userMessage.toLowerCase();
    
    // Check if it is a reasoning query (GPA, CGPA calculations, target mark calculations, grades, etc.)
    const isReasoningQuery = /gpa|cgpa|grade|target|fat|cat|marks|calculate|compute|predict/i.test(q);

    const modelConfigs = {
      "groq-deepseek": {
        url: "https://api.groq.com/openai/v1/chat/completions",
        auth: `Bearer ${groqKey}`,
        modelName: "deepseek-r1-distill-llama-70b",
      },
      "cerebras-llama-70b": {
        url: "https://api.cerebras.ai/v1/chat/completions",
        auth: `Bearer ${cerebrasKey}`,
        modelName: "llama-3.3-70b",
      },
      "cerebras-gpt": {
        url: "https://api.cerebras.ai/v1/chat/completions",
        auth: `Bearer ${cerebrasKey}`,
        modelName: "gpt-oss-120b",
      },
      "groq-llama": {
        url: "https://api.groq.com/openai/v1/chat/completions",
        auth: `Bearer ${groqKey}`,
        modelName: "llama-3.3-70b-versatile",
      },
      "cerebras-llama": {
        url: "https://api.cerebras.ai/v1/chat/completions",
        auth: `Bearer ${cerebrasKey}`,
        modelName: "llama3.1-8b",
      },
    };

    const tryRequest = async (configKey) => {
      const config = modelConfigs[configKey];
      if (!config) throw new Error("Invalid config key");

      const response = await fetch(config.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": config.auth,
        },
        body: JSON.stringify({
          model: config.modelName,
          messages,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error || !data.choices || data.choices.length === 0) {
        throw new Error(data.error?.message || "Invalid API response structure");
      }

      return data;
    };

    const priorityList = isReasoningQuery
      ? ["groq-deepseek", "cerebras-llama-70b", "groq-llama", "cerebras-gpt"]
      : ["cerebras-llama-70b", "groq-llama", "groq-deepseek"];

    // Filter priority list to only run models for which we have keys configured
    const activePriorityList = priorityList.filter(modelKey => {
      if (modelKey.startsWith("groq-") && !groqKey) return false;
      if (modelKey.startsWith("cerebras-") && !cerebrasKey) return false;
      return true;
    });

    if (activePriorityList.length === 0) {
      return new Response(JSON.stringify({ error: "Missing API key configuration: The requested models require API keys that are not configured in the environment." }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    let lastError = null;
    for (const modelKey of activePriorityList) {
      try {
        const data = await tryRequest(modelKey);
        // Successfully got a response, return it!
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (err) {
        console.warn(`Netlify Edge model fallback: ${modelKey} failed: ${err.message || err}. Trying next...`);
        lastError = err;
      }
    }

    return new Response(JSON.stringify({ error: `All models failed. Last error: ${lastError?.message || lastError}` }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error in Netlify Edge chat function:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
};

export const config = {
  path: "/api/chat",
};
