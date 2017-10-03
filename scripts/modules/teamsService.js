let teamsService = (() => {
    function listAllChirps(subs) {
        return requester.get('appdata', `chirps?query={"author":{"$in": ${subs}}}&sort={"_kmd.ect": 1`, 'kinvey');
    }

    function loadFollowing(username) {
        return requester.get('user', `?query={"username":"${username}"}`, 'kinvey');
    }

    return {
        listAllChirps,
        loadFollowing
    }
})();