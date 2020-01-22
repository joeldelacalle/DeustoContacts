<template>
    <div id="dashboard">
        <section>
            <div class="col1">
                <div class="profile">
                    <h5>{{ userProfile.name }}</h5>
                    <p>{{ userProfile.telephone }}</p>
                    <div class="create-contact">
                        <p>create a contact</p>
                        <form @submit.prevent>
                            <textarea v-model.trim="contact.content"></textarea>
                            <button @click="createContact" :disabled="contact.content == ''" class="button">contact</button>
                        </form>
                    </div>
                </div>
            </div>
            <div class="col2">
                <transition name="fade">
                    <div v-if="hiddenContacts.length" @click="showNewContacts" class="hidden-contacts">
                        <p>
                            Click to show <span class="new-contacts">{{ hiddenContacts.length }}</span>
                            new <span v-if="hiddenContacts.length > 1">contacts</span><span v-else>contact</span>
                        </p>
                    </div>
                </transition>
                <div v-if="contacts.length">
                    <div v-for="contact in contacts" class="contact">
                        <h5>{{ contact.userName }}</h5>
                        <span>{{ contact.createdOn | formatDate }}</span>
                        <p>{{ contact.content | trimLength }}</p>
                        <ul>
                            <li><a @click="openCommentModal(contact)">comments {{ contact.comments }}</a></li>
                            <li><a @click="likeContact(contact.id, contact.likes)">likes {{ contact.likes }}</a></li>
                            <li><a @click="viewContact(contact)">view full contact</a></li>
                        </ul>
                    </div>
                </div>
                <div v-else>
                    <p class="no-results">There are currently no contacts</p>
                </div>
            </div>
        </section>

        <!-- comment modal -->
        <transition name="fade">
            <div v-if="showCommentModal" class="c-modal">
                <div class="c-container">
                    <a @click="closeCommentModal">X</a>
                    <p>add a comment</p>
                    <form @submit.prevent>
                        <textarea v-model.trim="comment.content"></textarea>
                        <button @click="addComment" :disabled="comment.content == ''" class="button">add comment</button>
                    </form>
                </div>
            </div>
        </transition>

        <!-- contact modal -->
        <transition name="fade">
            <div v-if="showContactModal" class="p-modal">
                <div class="p-container">
                    <a @click="closeContactModal" class="close">X</a>
                    <div class="contact">
                        <h5>{{ fullContact.userName }}</h5>
                        <span>{{ fullContact.createdOn | formatDate }}</span>
                        <p>{{ fullContact.content }}</p>
                        <ul>
                            <li><a>comments {{ fullContact.comments }}</a></li>
                            <li><a>likes {{ fullContact.likes }}</a></li>
                        </ul>
                    </div>
                    <div v-show="contactComments.length" class="comments">
                        <div v-for="comment in contactComments" class="comment">
                            <p>{{ comment.userName }}</p>
                            <span>{{ comment.createdOn | formatDate }}</span>
                            <p>{{ comment.content }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
    import { mapState } from 'vuex'
    import moment from 'moment'
    const fb = require('../firebaseConfig.js')
    export default {
        data() {
            return {
                contact: {
                    content: ''
                },
                contacts: {
                    contactId: '',
                    userId: '',
                    content: '',
                    contactComments: 0
                },
                showCommentModal: false,
                showContactModal: false,
                fullContact: {},
                contactComments: []
            }
        },
        computed: {
            ...mapState(['userProfile', 'currentUser', 'contacts', 'hiddenContacts'])
        },
        methods: {
            createContact() {
                fb.contactsCollection.add({
                    createdOn: new Date(),
                    content: this.contact.content,
                    userId: this.currentUser.uid,
                    userName: this.userProfile.name,
                    userTelephone: this.userProfile.telephone,
                    comments: 0,
                    likes: 0
                }).then(ref => {
                    this.contact.content = ''
                }).catch(err => {
                    console.log(err)
                })
            },
            showNewContacts() {
                let updatedContactsArray = this.hiddenContacts.concat(this.contacts)
                // clear hiddenContacts array and update contacts array
                this.$store.commit('setHiddenContacts', null)
                this.$store.commit('setContacts', updatedContactsArray)
            },
            openCommentModal(contact) {
                this.comment.contactId = contact.id
                this.comment.userId = contact.userId
                this.comment.contactComments = contact.comments
                this.showCommentModal = true
            },
            closeCommentModal() {
                this.comment.contactId = ''
                this.comment.userId = ''
                this.comment.content = ''
                this.showCommentModal = false
            },
            addComment() {
                let contactId = this.comment.contactId
                let contactComments = this.comment.contactComments
                fb.commentsCollection.add({
                    createdOn: new Date(),
                    content: this.comment.content,
                    contactId: contactId,
                    userId: this.currentUser.uid,
                    userName: this.userProfile.name,
                    userTelephone: this.userProfile.telephone
                }).then(doc => {
                    fb.contactsCollection.doc(contactId).update({
                        comments: contactComments + 1
                    }).then(() => {
                        this.closeCommentModal()
                    })
                }).catch(err => {
                    console.log(err)
                })
            },
            likeContact(contactId, contactLikes) {
                let docId = `${this.currentUser.uid}_${contactId}`
                fb.likesCollection.doc(docId).get().then(doc => {
                    if (doc.exists) { return }
                    fb.likesCollection.doc(docId).set({
                        contactId: contactId,
                        userId: this.currentUser.uid
                    }).then(() => {
                        // update contact likes
                        fb.contactsCollection.doc(contactId).update({
                            likes: contactLikes + 1
                        })
                    })
                }).catch(err => {
                    console.log(err)
                })
            },
            viewContact(contact) {
                fb.commentsCollection.where('contactId', '==', contact.id).get().then(docs => {
                    let commentsArray = []
                    docs.forEach(doc => {
                        let comment = doc.data()
                        comment.id = doc.id
                        commentsArray.push(comment)
                    })
                    this.contactComments = commentsArray
                    this.fullContact = contact
                    this.showContactModal = true
                }).catch(err => {
                    console.log(err)
                })
            },
            closeContactModal() {
                this.contactComments = []
                this.showContactModal = false
            }
        },
        filters: {
            formatDate(val) {
                if (!val) { return '-' }
                let date = val.toDate()
                return moment(date).fromNow()
            },
            trimLength(val) {
                if (val.length < 200) { return val }
                return `${val.substring(0, 200)}...`
            }
        }
    }
</script>
