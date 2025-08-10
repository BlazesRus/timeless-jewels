<!-- src/lib/components/Spinner.svelte -->
<style>
  .spinner {
    border: 4px solid #ccc;
    border-top: 4px solid orange;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    animation: spin 0.8s linear infinite;
    margin: auto;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>

<div class="spinner" />
