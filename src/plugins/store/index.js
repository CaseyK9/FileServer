import Vue from "vue";
import Vuex from "vuex";

import uuid from "uuid/dist/v4";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        user: {
            loggedIn: false,
            id: "",
            username: "",
            email: "",
            files: []
        },
        app: {
            version: "",
            branch: "",
            uploads: "",
            views: "",
        }
    },
    getters: {
        loggedIn: state => {
            return state.user.loggedIn;
        },
        getUsername: state => {
            return state.user.username;
        },
        appVersion: state => {
            return `${state.app.branch} ${state.app.version}`;
        },
        myFiles: state => {
            return state.user.files;
        },
    },
    mutations: {
        login(state, data) {
            state.user = {
                loggedIn: true,
                id: data.id,
                username: data.username,
                email: data.email,
                files: state.user.files
            }

            data.self.$router.push("dashboard");
        },
        register(state, data) {
            data.self.accountCreated = true;
            setTimeout(() => { data.self.$router.push("dashboard"); }, 2000);
        },
        checkAuth(state, data) {
            state.user = {
                loggedIn: true,
                id: data.id,
                username: data.username,
                email: data.email,
                files: state.user.files
            }
        },
        noAuth(state, self) {
            state.user = {
                loggedIn: false,
                id: "",
                username: "",
                email: "",
                files: [],
            }

            if (self.$router.history.current.name !== "login") {
                self.$router.push("login");
            }
        },

        getStats(state, data) {
            state.app = data;
        },
        getFiles(state, data) {
            state.user.files = data;
        },
    },
    actions: {
        login({ commit }, payload) {
            return new Promise(async (resolve, reject) => {
                let response = await fetch(`${process.env.API_URI_V1}/auth/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username: payload.username,
                        password: payload.password
                    })
                });

                if (response.ok) {
                    let data = await response.json()
                        .catch(error => {
                            console.error(error);
                        });

                    commit("login", payload);
                    resolve(data);
                } else {
                    reject(response);
                }

            });
        },
        register({ commit }, payload) {
            return new Promise(async (resolve, reject) => {
                let response = await fetch(`${process.env.API_URI_V1}/auth/register`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: payload.email,
                        username: payload.username,
                        password: payload.password
                    })
                });

                if (response.ok) {
                    let data = await response.json()
                        .catch(error => {
                            console.error(error);
                        });

                    commit("register", payload);
                    resolve(data);
                } else {
                    reject(response);
                }
            });
        },
        checkAuth({ commit }, self) {
            return fetch(`${process.env.API_URI_V1}/auth/check`, { credentials: "include", })
                .then((r) => {
                    switch (r.status) {
                        case 200:
                            r.json()
                                .then((data) => {
                                    commit("checkAuth", data.data);
                                });
                            break;
                        case 401:
                            commit("noAuth", self);
                            break;
                        default:
                            console.error("Unknown status");
                            break;
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        },

        getVersion({ commit }, self) {
            return fetch(`${process.env.API_URI_V1}/server/version`, { credentials: "include", })
                .then((r) => {
                    switch (r.status) {
                        case 200:
                            r.json()
                                .then((data) => {
                                    commit("getVersion", data.data);
                                });
                            break;
                        case 401:
                            commit("noAuth", self);
                            break;
                        default:
                            console.error("Unknown status");
                            break;
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        },
        getStats({ commit }, self) {
            return fetch(`${process.env.API_URI_V1}/server/stats`)
                .then((r) => {
                    switch (r.status) {
                        case 200:
                            r.json()
                                .then((data) => {
                                    commit("getStats", data.data);
                                });
                            break;
                        case 401:
                            commit("noAuth", self);
                            break;
                        default:
                            console.error("Unknown status");
                            break;
                    }
                })
                .catch((error) => {
                    console.error(error);
                });

        },
        getFiles({ commit }, self) {
            let examples = [];
            for (let i = 0; i < 50; i++) {
                let id = uuid();
                examples.push({
                    id: `${id}`,
                    name: `${id}.png`,
                    url: `https://ss1.projectge.com/api/v1/${id}`
                });
            }

            commit("getFiles", examples);
        },

        logout({ commit }, self) {
            return fetch(`${process.env.API_URI_V1}/auth/logout`)
                .then((r) => {
                    commit("noAuth", self);
                })
                .catch((error) => {
                    console.error(error);
                });
        },
    }
});