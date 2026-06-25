> 仅内部参考 · 版权归原作者所有；请以原文链接为准，不用于公开转载。
> 标题：深度解析：Vue3如何巧妙的实现强大的computed
> 作者：ssh_晨曦时梦见兮（字节跳动前端工程师）
> 出处 URL：https://juejin.cn/post/6844904053638447117
> 采集日期：2026-06-25

---
# 深度解析：Vue3如何巧妙的实现强大的computed

## 前言

Vue 中的 computed 是一个非常强大的功能，在 computed 函数中访问到的值改变了后，computed 的值也会自动改变。

Vue2 中的实现是利用了`Watcher`的嵌套收集，`渲染watcher`收集到`computed watcher`作为依赖，`computed watcher`又收集到`响应式数据某个属性`作为依赖，这样在`响应式数据某个属性`发生改变时，就会按照 `响应式属性` -> `computed值更新` -> `视图渲染`这样的触发链触发过去，如果对 Vue2 中的原理感兴趣，可以看我这篇文章的解析：

[手把手带你实现一个最精简的响应式系统来学习 Vue 的 data、computed、watch 源码](https://juejin.cn/post/6844903981957791757 "https://juejin.cn/post/6844903981957791757")

## 前置知识

阅读本文需要你先学习 Vue3 响应式的基本原理，可以先看我的这篇文章，原理和 Vue3 是一致的： [带你彻底搞懂 Vue3 的 Proxy 响应式原理！TypeScript 从零实现基于 Proxy 的响应式库。](https://juejin.cn/post/6844904050014552072 "https://juejin.cn/post/6844904050014552072")

**如果对于 `effect`，`reactive` 等概念还不够熟悉，这篇文章暂时是没办法看的，可以先看上面那篇文章。**

在你拥有了一些前置知识以后，默认你应该知道的是：

1.  `effect`其实就是一个依赖收集函数，在它内部访问了响应式数据，响应式数据就会把这个`effect`函数作为依赖收集起来，下次响应式数据改了就触发它重新执行。

2.  `reactive`返回的就是个响应式数据，这玩意可以和`effect`搭配使用。

举个简单的栗子吧：

```
// 响应式数据
const data = reactive({ count: 0 });
// 依赖收集
effect(() => console.log(data.count));
// 触发上面的effect重新执行
data.count++;
```

就这个例子来说，data 是一个响应式数据。

effect 传入的函数因为内部访问到它上面的属性`count`了，

所以形成了一个`count -> effect`的依赖。

下次 count 改变了，这个 effect 就会重新执行，就这么简单。

## computed

那么引入本文中的核心概念，`computed`来改写这个例子后呢：

```
// 1. 响应式数据
const data = reactive({ count: 0 });
// 2. 计算属性
const plusOne = computed(() => data.count + 1);
// 3. 依赖收集
effect(() => console.log(plusOne.value));
// 4. 触发上面的effect重新执行
data.count++;
```

这样的例子也能跑通，为什么`data.count`的改变能**间接触发**访问了计算属性的 effect 的重新执行呢？

我们来配合单点调试一步步解析。

### 简化版源码

首先看一下简化版的`computed`的代码：

```
export function computed(getter) {
  let dirty = true;
  let value: T;

  // 这里还是利用了effect做依赖收集
  const runner = effect(getter, {
    // 这里保证初始化的时候不去执行getter
    lazy: true,
    computed: true,
    scheduler: () => {
      // 在触发更新时 只是把dirty置为true
      // 而不去立刻计算值 所以计算属性有lazy的特性
      dirty = true;
    },
  });
  return {
    get value() {
      if (dirty) {
        // 在真正的去获取计算属性的value的时候
        // 依据dirty的值决定去不去重新执行getter 获取最新值
        value = runner();
        dirty = false;
      }
      // 这里是关键 后续讲解
      trackChildRun(runner);
      return value;
    },
    set value(newValue: T) {
      setter(newValue);
    },
  };
}
```

可以看到，computed 其实也是一个`effect`。这里对闭包进行了巧妙的运用，注释里的几个关键点决定了计算属性拥有`懒加载`的特征，你不去读取 value 的时候，它是不会去真正的求值的。

### 前置准备

首先要知道，effect 函数会立即开始执行，再执行之前，先把`effect自身`变成全局的`activeEffect`，以供响应式数据收集依赖。

并且`activeEffect`的记录是用栈的方式，随着函数的开始执行入栈，随着函数的执行结束出栈，这样就可以维护嵌套的 effect 关系。

先起几个别名便于讲解

```
// 计算effect
computed(() => data.count + 1);
// 日志effect
effect(() => console.log(plusOne.value));
```

从依赖关系来看，
`日志effect`读取了`计算effect`
`计算effect`读取了响应式属性`count`
所以更新的顺序也应该是：
`count改变` -> `计算effect更新` -> `日志effect更新`

那么这个关系链是如何形成的呢

### 单步解读

在日志 effect 开始执行的时候，

⭐⭐
**此时 activeEffect 是日志 effect**

**此时的 effectStack 是\[ 日志 effect \]**
⭐⭐

plusOne.value 的读取，触发了

```
 get value() {
      if (dirty) {
        // 在真正的去获取计算属性的value的时候
        // 依据dirty的值决定去不去重新执行getter 获取最新值
        value = runner()
        dirty = false
      }
      // 这里是关键 后续讲解
      trackChildRun(runner)
      return value
},
```

首先进入了求值过程：`value = runner()`，runner 其实就是`计算effect`，它是对于用户传入的 getter 函数的包装，

进入了 runner 以后

⭐⭐
**此时 activeEffect 是计算 effect**

**此时的 effectStack 是\[ 日志 effect, 计算 effect \]**
⭐⭐
runner 所包裹的`() => data.count + 1`也就是`计算effect`会去读取`count`，因为是由 effect 包裹的函数，所以触发了响应式数据的`get`拦截：

此时`count`会收集`计算effect`作为自己的依赖。

并且`计算effect`会收集`count`的依赖集合，保存在自己身上。(通过`effect.deps`属性)

```
dep.add(activeEffect);
activeEffect.deps.push(dep);
```

也就是形成了一个**双向收集**的关系，

`计算effect`存了`count`的所有依赖，`count`也存了`计算effect`的依赖。

然后在 runner 运行结束后，`计算effect`出栈了，此时`activeEffect`变成了栈顶的`日志effect`

⭐⭐
**此时 activeEffect 是日志 effect**

**此时的 effectStack 是\[ 日志 effect \]**
⭐⭐

接下来进入**关键的步骤**：`trackChildRun`

```
trackChildRun(runner);

function trackChildRun(childRunner: ReactiveEffect) {
  for (let i = 0; i < childRunner.deps.length; i++) {
    const dep = childRunner.deps[i];
    dep.add(activeEffect);
  }
}
```

这个`runner`就是`计算effect`，它的`deps`上此时挂着`count`的依赖集合，

在`trackChildRun`中，它把当前的 activeEffect 也就是`日志effect`也加入到了`count`的依赖集合中。

此时`count`的依赖集合是这样的：`[ 计算effect, 日志effect ]`

这样下次`count`更新的时候，会把两个 effect 都重新触发，而由于触发的顺序是先触发`computed effect` 后触发`普通effect`，因此就完成了

1.  计算 effect 的 dirty 置为 true，标志着下次读取需要重新求值。
2.  日志 effect 读取计算 effect 的 value，获得最新的值并打印出来。

## 总结

不得不承认，computed 这个强大功能的实现果然少不了内部非常复杂的实现，这个双向依赖收集的套路相信也会给各位小伙伴带来很大的启发。跟着尤大学习，果然有肉吃！
