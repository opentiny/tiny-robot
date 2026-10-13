---
status: accepted
---

# Measure Web Component behavioral parity

The prototype will judge parity by observable behavior and integration capability, not by reproducing Vue-specific syntax. Primitive inputs use attributes where appropriate, complex inputs use DOM properties, outputs use kebab-case `CustomEvent`s, static customization uses native named slots where feasible, and scoped customization uses DOM renderer properties.

The final report must distinguish direct native support from adapter-provided support. Vue scoped slots cannot be counted as directly supported because native slots do not carry scoped slot properties.
