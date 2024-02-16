export function showUsername(user) {
    // returns the username of a user
    return `@${user?.username}`;
}

// export const defaultAvatar = "https://pbs.twimg.com/profile_images/1707730440331673600/oZeLdbKN_bigger.png"
export const defaultAvatar = "https://abs.twimg.com/sticky/default_profile_images/default_profile_bigger.png"

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
    if (interval > 1) return interval + "min";

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
    // TODO: read file headers to determine media type
    if (media.includes("mp4")) {
        return "video";
    }
    return "image";
}

export const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
]

export function getYears(minAge, maxAge) {
    if (minAge > maxAge) {
        throw new Error("minAge cannot be greater than maxAge")
    }

    const getCurrentYear = new Date().getFullYear();
    const startYear = getCurrentYear - minAge;
    const endYear = getCurrentYear - maxAge;

    const yearsArray = [];

    for (let year = startYear; year >= endYear; year--) {
        yearsArray.push(year);
    }
    return yearsArray;
} 
export function getDaysInMonth(year, month) {
    // Months are 0-indexed, so we subtract 1 from the provided month
    const date = new Date(year, month);
    const daysInMonth = [];
  
    // Iterate through each day of the month and push the day number
    while (date.getMonth() === month) {
      daysInMonth.push(date.getDate());
      date.setDate(date.getDate() + 1);
    }
  
    return daysInMonth;
  }

  export const evalRoom = (user, otherUser) => {
    if (!user || !otherUser) return null
    return [ user?.id, otherUser?.id ].sort().join('-')
}

  export const dayOptions = Array.from(Array(7), (_, i) => i+1)
  export const hourOptions = Array.from(Array(23), (_, i) => i+1)
  export const minuteOptions = Array.from(Array(59), (_, i) => i+1)