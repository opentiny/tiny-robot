import{Y as g,ag as d,b1 as m,G as h,y as a,cn as k,c6 as x,P as _,Q as y,bH as l,bb as i}from"./framework.6DE2p-7l.js";import{q as b,Q as C}from"./theme._IqFq64g.js";const w={style:{display:"flex","flex-direction":"column",gap:"16px"}},S={style:{display:"flex",gap:"8px","align-items":"center"}},r="二进制中1+1的结果是10。",c=`首先，用户的问题是：“二进制中1+1的结果是多少，请给出简要回答”。这是一个关于二进制加法的问题。

在二进制系统中，只有两个数字：0和1。当我们将1和1相加时，根据二进制加法规则，1 + 1等于10。这是因为在二进制中，1 + 1产生一个进位，所以结果为0，并进位1，因此写作10。

所以，二进制中1+1的结果是10。

用户要求简要回答，所以我应该直接给出答案，不需要过多解释。

最终回答：二进制中1+1的结果是10。`,N=g({__name:"reasoning",setup(T){const u=d(C,{style:{fontSize:"32px"}}),o=i(r),s=i(c),n=i({thinking:!1,open:!0}),p=async()=>{if(!n.value.thinking){n.value.thinking=!0,s.value="",o.value="";for(const t of c)await new Promise(e=>setTimeout(e,10)),s.value+=t;n.value.thinking=!1;for(const t of r)await new Promise(e=>setTimeout(e,10)),o.value+=t}},v=t=>{n.value[t.key]=t.value};return(t,e)=>(m(),h("div",w,[a("div",S,[a("label",null,[k(a("input",{type:"checkbox","onUpdate:modelValue":e[0]||(e[0]=f=>n.value.open=f)},null,512),[[x,n.value.open]]),e[1]||(e[1]=_(" 展开推理过程 ",-1))]),a("button",{onClick:p},"重放推理")]),y(l(b),{content:o.value,reasoning_content:s.value,avatar:l(u),state:n.value,onStateChange:v},null,8,["content","reasoning_content","avatar","state"])]))}});export{N as default};
