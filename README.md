## 安装

```bash
> npm link
```

## 查询车票

```bash
> train query 杭州 北京 2023-12-20

> train query 杭州 上海 2023-12-20
```

只看高铁

```bash
> train query hangzhou xuzhou 2023-12-20 -G
```

默认出发时间排序 可以添加--lishi按照历时排序

```bash
> train query hangzhou xuzhou 2023-12-20 --lishi
```
