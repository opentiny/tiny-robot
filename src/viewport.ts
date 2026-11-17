import { onMounted, onBeforeUnmount } from "vue";
/** Keep the composer inside the visual viewport while a mobile keyboard is open. */
export function useMobileViewport() {
  const viewport = window.visualViewport;
  let frame = 0;
  const update = () => {
    if (viewport && viewport.scale !== 1) return;
    const focused =
      innerWidth < 768 &&
      document.activeElement?.matches("textarea,input:not([type=file]),[contenteditable=true]");
    document.documentElement.style.setProperty(
      "--app-viewport-height",
      focused ? `${viewport?.height ?? innerHeight}px` : "100dvh",
    );
    document.documentElement.style.setProperty(
      "--app-viewport-top",
      focused ? `${viewport?.offsetTop ?? 0}px` : "0px",
    );
  };
  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(update);
  };
  onMounted(() => {
    viewport?.addEventListener("resize", schedule);
    viewport?.addEventListener("scroll", schedule);
    document.addEventListener("focusin", schedule);
    document.addEventListener("focusout", schedule);
  });
  onBeforeUnmount(() => {
    cancelAnimationFrame(frame);
    viewport?.removeEventListener("resize", schedule);
    viewport?.removeEventListener("scroll", schedule);
    document.removeEventListener("focusin", schedule);
    document.removeEventListener("focusout", schedule);
  });
}
