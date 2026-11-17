import { Directive, ElementRef, Input, inject } from '@angular/core'

@Directive({ selector: '[chatComposer]', standalone: true })
export class ComposerContainerDirective {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement
  @Input() set chatComposer(container: HTMLElement | null) {
    if (container?.parentNode === this.host) return
    this.host.replaceChildren(...(container ? [container] : []))
  }
}
