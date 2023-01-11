<script>
export default {
    props: ["set"]
}
</script>

<template>
    <div class="set-badge">
        <img :src="`/images/set-icons/${set}.svg`" />
        <span> {{ set.toUpperCase() }}</span>
    </div>
</template>

<style>
div.set-badges {
    display: flex;
    overflow-x: auto;

}

div.set-badge {
    flex: none;
    font-size: 15px;
    margin-right: 5px;
    background-color: #4b5257;
    color: white;
    border-radius: 2px;
    padding: 2px;
}

div.set-badge img {
    height: 15px;
    vertical-align: top;
    filter: invert(92%) sepia(100%) saturate(0%) hue-rotate(202deg) brightness(106%) contrast(106%);
}
</style>