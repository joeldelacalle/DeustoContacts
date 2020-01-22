import Vue from 'vue'
import Vuex from 'vuex'
const fb = require('./firebaseConfig.js')

Vue.use(Vuex)

// handle page reload
fb.auth.onAuthStateChanged(user => {
    if (user) {
        store.commit('setCurrentUser', user)
        store.dispatch('fetchUserProfile')

        fb.usersCollection.doc(user.uid).onSnapshot(doc => {
            store.commit('setUserProfile', doc.data())
        })

        // realtime updates from our contacts collection
        fb.contactsCollection.orderBy('createdOn', 'desc').onSnapshot(querySnapshot => {
            // check if created by currentUser
            let createdByCurrentUser
            if (querySnapshot.docs.length) {
                createdByCurrentUser = store.state.currentUser.uid == querySnapshot.docChanges[0].doc.data().userId ? true : false
            }

            // add new contacts to hiddenContacts array after initial load
            if (querySnapshot.docChanges.length !== querySnapshot.docs.length
                && querySnapshot.docChanges[0].type == 'added' && !createdByCurrentUser) {

                let contact = querySnapshot.docChanges[0].doc.data()
                contact.id = querySnapshot.docChanges[0].doc.id

                store.commit('setHiddenContacts', contact)
            } else {
                let contactsArray = []

                querySnapshot.forEach(doc => {
                    let contact = doc.data()
                    contact.id = doc.id
                    contactsArray.push(contact)
                })

                store.commit('setContacts', contactsArray)
            }
        })
    }
})

export const store = new Vuex.Store({
    state: {
        currentUser: null,
        userProfile: {},
        contacts: [],
        hiddenContacts: []
    },
    actions: {
        clearData({ commit }) {
            commit('setCurrentUser', null)
            commit('setUserProfile', {})
            commit('setContacts', null)
            commit('setHiddenContacts', null)
        },
        fetchUserProfile({ commit, state }) {
            fb.usersCollection.doc(state.currentUser.uid).get().then(res => {
                commit('setUserProfile', res.data())
            }).catch(err => {
                console.log(err)
            })
        },
        updateProfile({ commit, state }, data) {
            let name = data.name
            let telephone = data.telephone

            fb.usersCollection.doc(state.currentUser.uid).update({ name, telephone }).then(user => {
                // update all contacts by user to reflect new name
                fb.contactsCollection.where('userId', '==', state.currentUser.uid).get().then(docs => {
                    docs.forEach(doc => {
                        fb.contactsCollection.doc(doc.id).update({
                            userName: name
                        })
                    })
                })
                // update all comments by user to reflect new name
                fb.commentsCollection.where('userId', '==', state.currentUser.uid).get().then(docs => {
                    docs.forEach(doc => {
                        fb.commentsCollection.doc(doc.id).update({
                            userName: name
                        })
                    })
                })
            }).catch(err => {
                console.log(err)
            })
        }
    },
    mutations: {
        setCurrentUser(state, val) {
            state.currentUser = val
        },
        setUserProfile(state, val) {
            state.userProfile = val
        },
        setContacts(state, val) {
            if (val) {
                state.contacts = val
            } else {
                state.contacts = []
            }
        },
        setHiddenContacts(state, val) {
            if (val) {
                // make sure not to add duplicates
                if (!state.hiddenContacts.some(x => x.id === val.id)) {
                    state.hiddenContacts.unshift(val)
                }
            } else {
                state.hiddenContacts = []
            }
        }
    }
})
