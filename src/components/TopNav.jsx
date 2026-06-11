import icon from "/icon.png";

export default function TopNav({ activeAlgo, setActiveAlgo }) {
  return (
    <div className="h-16 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 z-20 shrink-0">
      <div className="flex items-center gap-3">
        <div className='h-10'><img className='h-[80px] -translate-y-6 -translate-x-6' src={icon} alt="icon" /></div>
        <h2 className='text-2xl -translate-x-9 font-bold'>Path Finder</h2>
      </div>
      <div className="flex gap-6 h-full items-end">
        {['dijkstra', 'bellman', 'floyd', 'compare'].map((algo) => (
          <button key={algo} onClick={() => setActiveAlgo(algo)} 
            className={`relative pb-4 text-sm font-bold tracking-wider uppercase transition-colors duration-300 ${
              activeAlgo === algo ? 'text-fuchsia-400' : 'text-zinc-500 hover:text-zinc-300'
            } group`}
          >
            {algo}
            <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-transform duration-300 origin-left ${
              activeAlgo === algo ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
            }`}></span>
          </button>
        ))}
      </div>
    </div>
  );
}