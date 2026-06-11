# Pathfinder 

Pathfinder Suite is a high-performance, polyglot visualizer for Single Source Shortest Path (SSSP) graph algorithms. It bridges the gap between theoretical algorithm learning and practical execution by pairing a modern, IDE-style React frontend with a blazing-fast C++ engine compiled to **WebAssembly (WASM)** .

## Motivation
Learning advanced Data Structures and Algorithms (DSA) can often feel abstract. While competitive programming platforms validate if your code works, they don't show you how it works.
The motivation behind Pathfinder was to build a "developer-first" sandbox that allows users to:

1 **Visualize Algorithms in Real-Time**: Watch how **Dijkstra** traverses nodes, or how **Bellman-Ford** catches negative weight cycles.

2 **Benchmark Performance**: Compare the raw execution time of different algorithms on the exact same graph topology.

3 **Write and Test Familiar Input**: Allow users to **input graphs** using standard competitive programming formats (CSES style).

## Tech Stack & Libraries


Core UI: React & Vite

Graph Rendering: React Flow

Layout Management: react-resizable-panels

Code Display: react-syntax-highlighter

Styling: Tailwind CSS

Backend Compilation: Emscripten (C++ to WebAssembly)

##  System Architecture
Pathfinder uses a **Polyglot Architecture**, intentionally splitting tasks between **JavaScript (UI/rendering)** and **C++ (memory-optimized computation)** for maximum performance.

### Layer 1: Presentation (React)
**The conductor**. It parses CSES text input, dynamically builds circular graph geometry using trigonometry (x = r⋅cos(θ), y = r⋅sin(θ)), and animates the resulting paths via React Flow.

### Layer 2: The Bridge (WASM & Emscripten)
**The translator**. Emscripten bindings allocate shared browser memory, allowing JavaScript to instantiate C++ classes and pass graph data directly into the compiled binary.

### Layer 3: Computation Engine (C++)
**The mathematical core**. Executes algorithms at near-native speeds utilizing optimized STL structures (std::unordered_map, std::priority_queue) and returns the optimal path, cost, and execution time.

### Execution Flow
**Input** (CSES format) ➔ **Sync** (Draw UI) ➔ **Execute** (Init WASM) ➔ **Compute** (C++ Engine) ➔ **Render** (Animate Path & Memory Cleanup)

## Getting Started

#### Prerequisites

Node.js (v18+)

Emscripten SDK (emsdk) Only required if modifying the C++ engine.

#### Installation

**1  Clone the repository:**
 ```
git clone [https://github.com/KrishnanshPuri/Path_finder.git](https://github.com/KrishnanshPuri/Path_finder.git)
cd Path_finder
```
**2 Install frontend dependencies:**
``` npm install ```

**3 Run the development server:**
``` npm run dev ```

*Compiling the C++ Engine:*
If you make changes to cpp-engine/GraphEngine.cpp, you must recompile the WebAssembly binary:

```emcc cpp-engine/GraphEngine.cpp -o src/graph_wasm.js -s MODULARIZE=1 -s EXPORT_ES6=1 -s EXPORT_NAME="createModule" --bind```




