cmake_minimum_required(VERSION 3.16)
project(GridPulse VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Engine Library
add_library(engine STATIC
    src/graph.cpp
    src/min_heap.cpp
    src/union_find.cpp
    src/bfs.cpp
    src/dfs.cpp
    src/dijkstra.cpp
    src/kruskal.cpp
    src/grid_generator.cpp
    src/storm_engine.cpp
    src/repair_engine.cpp
    src/city_state.cpp
    src/monte_carlo.cpp
)

target_include_directories(engine PUBLIC 
    ${CMAKE_CURRENT_SOURCE_DIR}/include
)

# CLI Test Harness
add_executable(gridpulse_cli
    cli/main.cpp
)

target_include_directories(gridpulse_cli PRIVATE 
    ${CMAKE_CURRENT_SOURCE_DIR}/include
)

target_link_libraries(gridpulse_cli engine)