<template>
    <section id="settings">
        <div class="col1">
            <h3>Settings</h3>
            <p>Update your profile</p>

            <transition name="fade">
                <p v-if="showSuccess" class="success">profile updated</p>
            </transition>

            <form @submit.prevent>
                <label for="name">Name</label>
                <input v-model.trim="name" type="text" :placeholder="userProfile.name" id="name" />

                <label for="telephone">Numero de Telefono</label>
                <input v-model.trim="telephone" type="text" :placeholder="userProfile.telephone" id="telephone" />

                <button @click="updateTelephone" class="button">Actualizar Telefono</button>
            </form>
        </div>
    </section>
</template>

<script>
    import { mapState } from 'vuex'
    export default {
        data() {
            return {
                name: '',
                telephone: '',
                showSuccess: false
            }
        },
        computed: {
            ...mapState(['userProfile'])
        },
        methods: {
            updateProfile() {
                this.$store.dispatch('updateProfile', {
                    name: this.name !== '' ? this.name : this.userProfile.name,
                    title: this.telephone !== '' ? this.telephone : this.userTelephone.telephone
                })
                this.name = ''
                this.telephone = ''
                this.showSuccess = true
                setTimeout(() => { this.showSuccess = false }, 2000)
            }
        }
    }
</script>
