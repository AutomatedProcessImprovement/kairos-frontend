<template>
    <transition name="modal">
        <div v-if="modalIsOpen">
            <div class="overlay">
                <div class="modal-div shadow">
                    <div>
                        <span>Loading...</span>
                    </div>
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