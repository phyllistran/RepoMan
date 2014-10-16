_.templateSettings.interpolate = /{([\s\S]+?)}/g;

// first, we wrote out all the functions needed to get information & load information.


function RepoMan(githubUsername) {
    this.username = githubUsername;

    this.init();
}

//these .get functions are getting information from the api 
RepoMan.prototype.getUserInfo = function() {
	//so this is getting the information from api.github.com/users/(insert your user name, which will be identified at the very bottom) 
    return $.get('https://api.github.com/users/' + this.username).then(function(data) {
        return data;
    });
};


RepoMan.prototype.getRepoInfo = function() {
	//same thing as .getUserInfo but the information about the repos is on a different url so we need to create another function. 
    return $.get('https://api.github.com/users/' + this.username + '/repos').then(function(data) {
        return data;
    });
};

//this is getting the templates that are setup from html

RepoMan.prototype.loadTemplateFile = function(templateName) {
	//templateNames get identified in .init function
    return $.get('./templates/' + templateName + '.html').then(function(htmlstring) {
        return htmlstring;
    });
};
// here we are basically connecting the .get & .load fuctions together

RepoMan.prototype.putProfileDataOnPage = function(profileHtml, profile) {
    //the date on the API is worded weird, so if we simply pull from that then it will show ugly, so we we have to create a new var and 'reword it'
    var d = new Date(profile.created_at);
    profile.joined = ["Joined on ", d.toDateString()].join("");
    //putting the profile information on the left column
    // ??? what is .innerHTML
    document.querySelector('.left-column').innerHTML = _.template(profileHtml, profile);
};

RepoMan.prototype.putRepoDataOnPage = function(repoHtml, repos) {
	console.log(repos)
//so here, we are doing the same thing for dates as earlier, except we are sorting it by chronological order, which we used a sort function
    document.querySelector('.right-column').innerHTML =
        repos.sort(function(a, b) {
            var firstDate = new Date(a.updated_at),
                secondDate = new Date(b.updated_at);
            return +firstDate > +secondDate ? -1 : 1;
        }).map(function(obj) {
            var d = new Date(obj.updated_at);
            obj.updated = ["Updated on ", d.toDateString()].join("");

            return _.template(repoHtml, obj);
        }).join("")
};

//the function that ties it all together.
RepoMan.prototype.init = function() {
	// 'this' looses its value in .then fuction, so we have to give it a var called self. that we can call it again. (technically we can just write self.blahblah on everything, but just demonstrating where it value gets lost in the function)
    var self = this;
    // start doing shit...
    $.when(
        this.getUserInfo(),
        this.getRepoInfo(),
        this.loadTemplateFile('profile'),
        this.loadTemplateFile('repo')
    ).then(function(profile, repos, profileHtml, repoHtml) {
        self.putProfileDataOnPage(profileHtml, profile)
        self.putRepoDataOnPage(repoHtml, repos)
    })
};

window.onload = app;

function app() {
	//identifying the username.
    var myRepo = new RepoMan('matthiasak');
}