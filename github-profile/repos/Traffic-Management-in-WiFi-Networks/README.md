# Modeling and Enhancing IoT Traffic Management in Wi-Fi Networks

B.Tech major project (Batch 13): modelling how IoT traffic behaves on Wi-Fi networks with the **NS-3** network
simulator, and evaluating ways to keep it fair and responsive. This repository holds the project's presentation
website (`index.html`, `styles.css`, `script.js`) and screenshots of the simulation output.

## Objectives

- Set up the simulation environment
- Measure normal routing performance
- Distribute bandwidth equally between devices
- Reduce latency
- Maintain stable performance

## Simulation

**Topology.** The NS-3 script creates a mixed network of CSMA nodes and Wi-Fi stations, configured from the command
line:

| Parameter | Meaning |
| --- | --- |
| `nCsma` | Number of extra CSMA nodes to create |
| `nWifi` | Number of Wi-Fi STA devices to create |
| `verbose` | Enable logging for the echo applications |
| `tracing` | Write packet-level PCAP traces |
| `asciitracing` | Write human-readable ASCII traces |

**Routing performance.** A MANET experiment compares the AODV, OLSR, DSDV and DSR routing protocols on throughput,
packet delivery ratio and delay.

## Screenshots

The PNG files in this repository show the CSMA nodes, the Wi-Fi STA devices, and the combined node topology.

## View it

Open `index.html` in a browser, or enable GitHub Pages for this repository (Settings → Pages → Deploy from branch).

## Tools

NS-3 · HTML · CSS · JavaScript
