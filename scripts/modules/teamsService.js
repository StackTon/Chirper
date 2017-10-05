let teamsService = (() => {
    function listAllChirps(subs) {
        return requester.get('appdata', `chirper?query={"author":{"$in": ${subs}}}&sort={"_kmd.ect": 1`, 'kinvey');
    }

    function loadFollowing(username) {
        return requester.get('user', `?query={"username":"${username}"}`, 'kinvey');
    }

    function loadCountChirps(username) {
        return requester.get('appdata', `chirper?query={"author":"${username}"}`, 'kinvey');
    }

    function loadFollowers(username) {
        return requester.get('user', `?query={"subscriptions":"${username}"}`, 'kinvey');
    }

    function createChirp(data){
        return requester.post('appdata', 'chirper', 'kinvey', data);
    }
    
    function loadAllUsers(){
        return requester.get('user', '', 'kinvey');
    }

    function userChirps(username){
        return requester.get('appdata', `chirper?query={"author":"${username}"}&sort={"_kmd.ect": 1}`, 'kinvey');
    }
    return {
        listAllChirps,
        loadFollowing,
        loadCountChirps,
        loadFollowers,
        createChirp,
        loadAllUsers,
        userChirps
    };
})();