export function showUsername(user) {
    // returns the username of a user
    return `@${user?.username}`;
}

export function showName(user) {
    // returns the full name of a user
    return `${user?.fname} ${user?.lname}`;
}

export const defaultAvatar = "https://pbs.twimg.com/profile_images/1707730440331673600/oZeLdbKN_bigger.png"

export function timeAgo (date) {
    // returns a date in a time ago format

    if (typeof date === "string") {
        date = new Date(date);
    }

    var seconds = Math.floor(((new Date().getTime()/1000) - date.getTime() / 1000)),
    interval = Math.floor(seconds / 31536000);

    if (interval > 1) return interval + "y";

    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return interval + "m";

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + "d";

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + "h";

    interval = Math.floor(seconds / 60);
    if (interval > 1) return interval + "m ";

    return Math.floor(seconds) + "s";
}

export function quantiyFormat (number) {
    // returns a number in a compact format
   return Intl.NumberFormat('en-US',{
   notation: "compact",
   maximumFractionDigits: 1
   }
   ).format(number);
}

export function parseMedia(media){
    // returns if media is image or video
    if (media.includes("mp4")) {
        return "video";
    }
    return "image";
}

