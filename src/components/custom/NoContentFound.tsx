export default function NoContentFound() {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center select-none">
            <h3 className="text-base font-black tracking-widest bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent uppercase">
                No Records Available
            </h3>
            <p className="text-[10px] font-bold text-gray-400 dark:text-zinc-500/80 mt-1 uppercase tracking-wider">
                No details found for the selected tab.
            </p>
        </div>
    );
}