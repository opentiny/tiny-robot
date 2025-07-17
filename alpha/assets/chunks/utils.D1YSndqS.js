function e(n){if(typeof n=="number")return`${n}px`;const r=n==null?void 0:n.trim();return r?/^-?\d+(\.\d+)?$/.test(r)?`${r}px`:r:"0px"}export{e as n};
