import { deepmerge } from 'deepmerge-ts';
import { shouldCenterStep } from './general.ts';
import {
  autoUpdate,
  arrow,
  computePosition,
  flip,
  autoPlacement,
  limitShift,
  shift,
  type ComputePositionConfig,
  type MiddlewareData,
  type Placement,
  type Alignment,
  offset,
  hide,
  size
} from '@floating-ui/dom';
import type { Step, StepOptions, StepOptionsAttachTo } from '../step.ts';
import { isHTMLElement } from './type-check.ts';

/**
 * Determines options for the tooltip and initializes event listeners.
 *
 * @param step The step instance
 */
export function setupTooltip(step: Step): ComputePositionConfig {
  if (step.cleanup) {
    step.cleanup();
  }

  const attachToOptions = step._getResolvedAttachToOptions();

  let target = attachToOptions.element as HTMLElement;
  const floatingUIOptions = getFloatingUIOptions(attachToOptions, step);
  const shouldCenter = shouldCenterStep(attachToOptions);

  if (shouldCenter) {
    target = document.body;
    // @ts-expect-error TODO: fix this type error when we type Svelte
    const content = step.shepherdElementComponent.getElement();
    content.classList.add('shepherd-centered');
  }

  step.cleanup = autoUpdate(target, step.el as HTMLElement, () => {
    // The element might have already been removed by the end of the tour.
    if (!step.el) {
      step.cleanup?.();
      return;
    }

    setPosition(target, step, floatingUIOptions, shouldCenter);
  });

  step.target = attachToOptions.element as HTMLElement;

  return floatingUIOptions;
}

/**
 * Merge tooltip options handling nested keys.
 *
 * @param tourOptions - The default tour options.
 * @param options - Step specific options.
 *
 * @return {floatingUIOptions: FloatingUIOptions}
 */
export function mergeTooltipConfig(
  tourOptions: StepOptions,
  options: StepOptions
): { floatingUIOptions: ComputePositionConfig } {
  return {
    floatingUIOptions: deepmerge(
      tourOptions.floatingUIOptions || {},
      options.floatingUIOptions || {}
    )
  };
}

/**
 * Cleanup function called when the step is closed/destroyed.
 *
 * @param step
 */
export function destroyTooltip(step: Step) {
  if (step.cleanup) {
    step.cleanup();
  }

  step.cleanup = null;
}

function setPosition(
  target: HTMLElement,
  step: Step,
  floatingUIOptions: ComputePositionConfig,
  shouldCenter: boolean
) {
  return (
    computePosition(target, step.el as HTMLElement, floatingUIOptions)
      .then(floatingUIposition(step, shouldCenter))
      // Wait before forcing focus.
      .then(
        (step: Step) =>
          new Promise<Step>((resolve) => {
            setTimeout(() => resolve(step), 300);
          })
      )
      // Replaces focusAfterRender modifier.
      .then((step: Step) => {
        if (step?.el) {
          step.el.focus({ preventScroll: true });
        }
      })
  );
}

function floatingUIposition(step: Step, shouldCenter: boolean) {
  return ({
    x,
    y,
    placement,
    middlewareData
  }: {
    x: number;
    y: number;
    placement: Placement;
    middlewareData: MiddlewareData;
  }) => {
    if (!step.el) {
      return step;
    }

    if (shouldCenter) {
      Object.assign(step.el.style, {
        position: 'fixed',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)'
      });
    } else {
      Object.assign(step.el.style, {
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`
      });
    }

    // Will hide the popup when the target is not visible
    // and will make it visbile when the target appears again
    if (middlewareData.hide) {
      Object.assign(step.el.style, {
        visibility: middlewareData.hide.referenceHidden ? 'hidden' : 'visible'
      });
    }

    step.el.dataset['popperPlacement'] = placement;

    placeArrow(step.el, middlewareData);

    return step;
  };
}

function placeArrow(el: HTMLElement, middlewareData: MiddlewareData) {
  const arrowEl = el.querySelector('.shepherd-arrow');
  if (isHTMLElement(arrowEl) && middlewareData.arrow) {
    const { x: arrowX, y: arrowY } = middlewareData.arrow;
    Object.assign(arrowEl.style, {
      left: arrowX != null ? `${arrowX}px` : '',
      top: arrowY != null ? `${arrowY}px` : ''
    });
  }
}

/**
 * Gets the `Floating UI` options from a set of base `attachTo` options
 * @param attachToOptions
 * @param step The step instance
 * @private
 */
export function getFloatingUIOptions(
  attachToOptions: StepOptionsAttachTo,
  step: Step
): ComputePositionConfig {
  const options: ComputePositionConfig = {
    strategy: 'absolute'
  };

  options.middleware = [];

  const arrowEl = addArrow(step);

  const shouldCenter = shouldCenterStep(attachToOptions);

  const hasAutoPlacement = attachToOptions.on?.includes('auto');

  const hasEdgeAlignment =
    attachToOptions?.on?.includes('-start') ||
    attachToOptions?.on?.includes('-end');

  if (!shouldCenter) {
    if (hasAutoPlacement) {
      options.middleware.push(
        autoPlacement({
          crossAxis: true,
          alignment: hasEdgeAlignment
            ? (attachToOptions?.on?.split('-').pop() as Alignment)
            : null
        })
      );
    } else {
      options.middleware.push(flip({fallbackAxisSideDirection: 'start'}));
    }

    if (!attachToOptions.strict)
      options.middleware.push(
        // Replicate PopperJS default behavior.
        shift({
          limiter: limitShift(),
          crossAxis: true
        })
      );

    if (arrowEl) {
      const arrowOptions =
        typeof step.options.arrow === 'object'
          ? step.options.arrow
          : { padding: 4 };

      options.middleware.push(
        arrow({
          element: arrowEl,
          padding: hasEdgeAlignment ? arrowOptions.padding : 22
        })
      );
    }

    options.middleware.push(offset(step.options.offset || 0));

    options.middleware.push(hide({ strategy: 'referenceHidden' }));

    options.middleware.push(size())

    if (!hasAutoPlacement) options.placement = attachToOptions.on as Placement;
  }

  return deepmerge(options, step.options.floatingUIOptions || {});
}

function addArrow(step: Step) {
  if (step.options.arrow && step.el) {
    return step.el.querySelector('.shepherd-arrow');
  }

  return false;
}

export function positionOverlay(step: Step): ComputePositionConfig | void {
  const overlay = step._overlay?.element as HTMLElement;
  const target = step._resolvedAttachTo?.element as HTMLElement;
  const paddingX = step.options.overlay?.paddingX || 0;
  const paddingY = step.options.overlay?.paddingY || 0;

  if (!step._overlay) return;

  step._overlay?.cleanup?.();

  const options: ComputePositionConfig = {
    placement: 'top-start',
    middleware: [hide({ strategy: 'referenceHidden' })]
  };

  const cleanup = autoUpdate(target, overlay, () => {
    if (!target || !overlay) {
      step._overlay?.cleanup?.();
      return;
    }

    computePosition(target, overlay, options).then(({ middlewareData }) => {
      const targetRect = target.getBoundingClientRect();
      const scrollContainer = getScrollableAncestor(target);
      const containerRect = scrollContainer?.getBoundingClientRect() ?? {
        top: 0,
        left: 0,
        right: window.innerWidth,
        bottom: window.innerHeight,
      };

      const isHidden = middlewareData.hide?.referenceHidden || false;
      if (isHidden) {
        overlay.style.visibility = 'hidden';
        return;
      }

      const visibleLeft = Math.max(targetRect.left - paddingX, containerRect.left);
      const visibleTop = Math.max(targetRect.top - paddingY, containerRect.top);
      const visibleRight = Math.min(targetRect.right + paddingX, containerRect.right);
      const visibleBottom = Math.min(targetRect.bottom + paddingY, containerRect.bottom);

      const visibleWidth = Math.max(0, visibleRight - visibleLeft);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);

      Object.assign(overlay.style, {
        position: 'absolute',
        left: `${visibleLeft + window.scrollX}px`,
        top: `${visibleTop + window.scrollY}px`,
        width: `${visibleWidth}px`,
        height: `${visibleHeight}px`,
        visibility: 'visible',
        padding: `${paddingY}px ${paddingX}px`,
        boxSizing: 'border-box',
      });
    });
  });

  step._overlay.cleanup = cleanup;

  return options;
}


const getScrollableAncestor = (el: HTMLElement): HTMLElement | null => {
  let parent = el.parentElement;
  while (parent) {
    const style = getComputedStyle(parent);
    const overflowY = style.overflowY;
    const overflowX = style.overflowX;

    const isScrollableStyle = /(auto|scroll|overlay)/.test(overflowY + overflowX);
    const isActuallyOverflowing =
      parent.scrollHeight > parent.clientHeight || parent.scrollWidth > parent.clientWidth;

    if (isScrollableStyle && isActuallyOverflowing) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
};
