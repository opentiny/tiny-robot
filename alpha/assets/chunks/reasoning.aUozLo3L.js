import{N as g,a6 as d,aL as m,v as h,w as a,bL as k,bw as x,I as _,J as w,bk as i,aU as l}from"./framework.CV5uswMq.js";import{l as y,c as C}from"./theme.Cjqa5y9-.js";const b={style:{display:"flex","flex-direction":"column",gap:"16px"}},N={style:{display:"flex",gap:"8px","align-items":"center"}},r="二进制中1+1的结果是10。",c=`首先，用户的问题是：“二进制中1+1的结果是多少，请给出简要回答”。这是一个关于二进制加法的问题。

在二进制系统中，只有两个数字：0和1。当我们将1和1相加时，根据二进制加法规则，1 + 1等于10。这是因为在二进制中，1 + 1产生一个进位，所以结果为0，并进位1，因此写作10。

所以，二进制中1+1的结果是10。

用户要求简要回答，所以我应该直接给出答案，不需要过多解释。

最终回答：二进制中1+1的结果是10。`,B=g({__name:"reasoning",setup(S){const u=d(y,{style:{fontSize:"32px"}}),o=l(r),s=l(c),t=l({thinking:!1,open:!0}),v=async()=>{if(!t.value.thinking){t.value.thinking=!0,s.value="",o.value="";for(const n of c)await new Promise(e=>setTimeout(e,10)),s.value+=n;t.value.thinking=!1;for(const n of r)await new Promise(e=>setTimeout(e,10)),o.value+=n}},p=n=>{t.value[n.key]=n.value};return(n,e)=>(m(),h("div",b,[a("div",N,[a("label",null,[k(a("input",{type:"checkbox","onUpdate:modelValue":e[0]||(e[0]=f=>t.value.open=f)},null,512),[[x,t.value.open]]),e[1]||(e[1]=_(" 展开推理过程 ",-1))]),a("button",{onClick:v},"重放推理")]),w(i(C),{content:o.value,reasoning_content:s.value,avatar:i(u),state:t.value,onStateChange:p},null,8,["content","reasoning_content","avatar","state"])]))}});export{B as default};
