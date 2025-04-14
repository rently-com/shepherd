<script>
  import ShepherdButton from './shepherd-button.svelte';
  import { isFunction } from '../utils/type-check';

  export let step, footerText;

  $: buttons = step.options.buttons;
  $: footerText = isFunction(footerText) ? step.options.footerText() : step.options.footerText;
</script>

<footer class="shepherd-footer">
  {#if footerText}
    <span class="shepherd-footer-text">{footerText}</span>
  {/if}
  {#if buttons}
    {#each buttons as config}
      <ShepherdButton {config} {step} />
    {/each}
  {/if}
</footer>

<style global>
  .shepherd-footer {
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    }

  .shepherd-footer .shepherd-button:last-child {
    margin-right: 0;
    align-self: flex-end;
  }

  .shepherd-footer-text {
    font-family: Inter;
    font-size: 0.75rem;
    line-height: 20px;
    letter-spacing: 0px;
    font-weight: 400;
    color: #4B5563;
  }
</style>
