import express, { Request, Response } from "express";
import axios from "axios";
import type { Router } from "express";

const router: Router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { messages, model } = req.body;

    const groqKey = process.env.GROQ_API_KEY;
    const cerebrasKey = process.env.CEREBRAS_API_KEY;

    if (!groqKey && !cerebrasKey) {
      return res.status(500).json({ error: "Missing API key configuration: Neither GROQ_API_KEY nor CEREBRAS_API_KEY is configured in the environment." });
    }

    if (model) {
      // Custom model routing (e.g. for client vision OCR or PDF extraction)
      let url = "https://api.groq.com/openai/v1/chat/completions";
      let auth = `Bearer ${groqKey}`;

      if (model.includes("cerebras") || model.startsWith("llama3.1-") || model.startsWith("qwen-3-") || model.startsWith("gpt-oss-")) {
        if (!cerebrasKey) {
          return res.status(400).json({ error: "Cerebras API key is not configured in the environment." });
        }
        url = "https://api.cerebras.ai/v1/chat/completions";
        auth = `Bearer ${cerebrasKey}`;
      } else {
        if (!groqKey) {
          return res.status(400).json({ error: "Groq API key is not configured in the environment." });
        }
      }

      try {
        const response = await axios.post(
          url,
          {
            model,
            messages,
          },
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": auth,
            },
            timeout: 20000,
          }
        );
        return res.status(200).json(response.data);
      } catch (err: any) {
        const errMsg = err.response?.data?.error?.message || err.message || err;
        console.error(`Express custom model call failed: ${model} failed: ${errMsg}`);
        return res.status(500).json({ error: `Custom model call failed: ${errMsg}` });
      }
    }

    const userMessage = messages[messages.length - 1]?.content || "";
    const q = userMessage.toLowerCase();

    // Check if it is a reasoning query (GPA, CGPA calculations, target mark calculations, grades, etc.)
    const isReasoningQuery = /gpa|cgpa|grade|target|fat|cat|marks|calculate|compute|predict/i.test(q);

    const modelConfigs: Record<string, { url: string; auth: string; modelName: string }> = {
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

    const tryRequest = async (configKey: string) => {
      const config = modelConfigs[configKey];
      if (!config) throw new Error("Invalid config key");

      const response = await axios.post(
        config.url,
        {
          model: config.modelName,
          messages,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": config.auth,
          },
          timeout: 10000, // 10s timeout to switch quickly on failures
        }
      );

      if (response.data.error || !response.data.choices || response.data.choices.length === 0) {
        throw new Error(response.data.error?.message || "Invalid API response structure");
      }

      return response.data;
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
      return res.status(500).json({ error: "Missing API key configuration: The requested models require API keys that are not configured in the environment." });
    }

    let lastError: any = null;
    for (const modelKey of activePriorityList) {
      try {
        const data = await tryRequest(modelKey);
        return res.status(200).json(data);
      } catch (err: any) {
        const errMsg = err.response?.data?.error?.message || err.message || err;
        console.warn(`Express model fallback: ${modelKey} failed: ${errMsg}. Trying next...`);
        lastError = err;
      }
    }

    return res.status(500).json({ error: `All models failed. Last error: ${lastError?.response?.data || lastError?.message || lastError}` });
  } catch (error: any) {
    console.error("Error in Express chat route:", error.response?.data || error.message || error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
