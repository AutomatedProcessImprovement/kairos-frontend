<template>
    <transition name="modal">
        <div v-if="modalIsOpen">
            <div class="overlay">
                <div id="loading">
                    Please wait...
                </div>
            </div>
        </div>
    </transition>
</template>

<style scoped>
    
</style>

<script>
export default {
    name: "LoadingComponent",
    data: function () {
        return {
            modalIsOpen: true,
        }
    }
}
</script>