import { defineComponent as c, computed as d, openBlock as i, createElementBlock as r, normalizeClass as u, renderSlot as b } from "vue";
const m = ["disabled"], p = /* @__PURE__ */ c({
  __name: "Button",
  props: {
    variant: { default: "primary" },
    size: { default: "md" },
    disabled: { type: Boolean, default: !1 }
  },
  emits: ["click"],
  setup(e, { emit: n }) {
    const t = e, o = n, s = d(() => [
      "btn",
      `btn-${t.variant}`,
      `btn-${t.size}`,
      { "btn-disabled": t.disabled }
    ]), l = (a) => {
      t.disabled || o("click", a);
    };
    return (a, _) => (i(), r("button", {
      class: u(s.value),
      disabled: e.disabled,
      onClick: l
    }, [
      b(a.$slots, "default", {}, void 0, !0)
    ], 10, m));
  }
}), f = (e, n) => {
  const t = e.__vccOpts || e;
  for (const [o, s] of n)
    t[o] = s;
  return t;
}, v = /* @__PURE__ */ f(p, [["__scopeId", "data-v-b0f182b6"]]);
export {
  v as Button
};
