# Tiny Robot Chat

This context defines the language used while validating TrChat as browser-native custom elements.

## Language

**Experimental entry**:
A published but non-stable subpath used to validate APIs before they become part of TrChat's supported surface.
_Avoid_: Beta package, separate Web Component package

**Baseline example**:
One of the Vue documentation examples from PR #452 whose observable behavior is the reference for a corresponding Web Component example.
_Avoid_: Golden implementation

**Behavioral parity**:
Equivalent user-visible behavior and integration capability across the Vue and Web Component forms; identical framework-specific syntax is not required.
_Avoid_: API identity, syntax parity

**Owned runtime**:
A Chat Runtime created for and managed by a custom-element instance, including non-destructive disposal when that instance is removed.
_Avoid_: Internal runtime

**Injected runtime**:
A Chat Runtime supplied through a custom-element DOM property whose lifecycle remains the caller's responsibility.
_Avoid_: External runtime
