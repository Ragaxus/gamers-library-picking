<script>
export default {
    props: ["set", "price"]
}
</script>

<template>
    <div class="set-badge">
        <img :src="`/images/set-icons/${set}.svg`" />
        <span> {{ set.toUpperCase() }}</span>
        <div id="divPrice" v-if="price != null">
            ${{ price }}
        </div>
    </div>
</template>

<style>
#divPrice {
    border-left: thin solid white;
    margin-left: 2px;
    padding-left: 2px;
}

div.set-badge {
    display: flex;
    justify-content: center;
    font-size: 15px;
    margin-right: 5px;
    background-color: #4b5257;
    color: white;
    border-radius: 2px;
    padding: 2px;
}

div.set-badge img {
    padding-right: 5px;
    height: 20px;
    vertical-align: top;
    filter: invert(92%) sepia(100%) saturate(0%) hue-rotate(202deg) brightness(106%) contrast(106%);
}
</style>