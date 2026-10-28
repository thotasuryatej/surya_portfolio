# A Machine Learning Approach for Efficient Task Scheduling in Fog Computing

Comparing algorithms for assigning tasks to virtual machines in a fog-computing environment: **FCFS**,
**Round Robin**, **Shortest Job First** and **PBKMS**. Each schedule is evaluated on makespan, speedup, efficiency
and how tasks are spread across the VMs.

**PBKMS** is the machine-learning approach: it groups tasks with **K-means** clustering on their execution times, then
schedules them with a **HEFT**-style list scheduler (tasks ranked by upward rank over a task graph with communication
costs).

## Contents

| Path | What it is |
| --- | --- |
| `Untitled.ipynb` | The analysis notebook: the four schedulers, evaluation, and comparison plots |
| `unified_dataset_with_task_labels.csv` | The task dataset used in the notebook |
| `index.html`, `css/`, `js/`, `images/` | A small website presenting the results and comparison graph |

## Run it

Open the notebook in Jupyter with the CSV in the same folder. It needs pandas, NumPy, scikit-learn, NetworkX and
Matplotlib:

```
pip install pandas numpy scikit-learn networkx matplotlib
```

To view the results site, open `index.html` in a browser, or enable GitHub Pages for this repository
(Settings → Pages → Deploy from branch).

## Tools

Python · scikit-learn · NetworkX · pandas · Matplotlib · Jupyter · HTML · CSS · JavaScript
