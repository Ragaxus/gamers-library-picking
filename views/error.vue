<script>
export default {
    data: function() {
        return {
            error: {}
        }
    }
}
</script>

<template>
    <div id="app">
        <h1>Error</h1>
        <p>{{ error.message }}</p>
    </div>
</template>