export function showUsername(user) {
    // returns the username of a user
    return `@${user?.username}`;
}

// export const defaultAvatar = "https://pbs.twimg.com/profile_images/1707730440331673600/oZeLdbKN_bigger.png"
export const defaultAvatar = "https://abs.twimg.com/sticky/default_profile_images/default_profile_bigger.png"

export function timeAgo (date, initialDate = new Date()) {
    // returns a date in a time ago format
    if (!date) return

    if (typeof date === "string") {
        date = new Date(date);
    }

    if (typeof initialDate === "string") {
        initialDate = new Date(initialDate);
    }

    var seconds = Math.floor(((initialDate.getTime()/1000) - date.getTime() / 1000))
    var interval = Math.floor(seconds / 31536000);

    if (interval > 1) return interval + "y";

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval + "m";

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + "d";

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + "h";

    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + "min";

    return Math.floor(seconds) + "s";
}

export function quantityFormat (number) {
    // returns a number in a compact format
    return Intl.NumberFormat('en-US',{
    notation: "compact",
    maximumFractionDigits: 1
    }
    ).format(number);
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

export function getJoinDate(date) {
    const options = {
        month: 'long',
        year: 'numeric',
    };

    if (typeof date === "string") {
    return new Date(date).toLocaleDateString('en-US', options);
    }
    else if (typeof date === "object") {
        // expects a date object with day, month and year properties
        return new Date(date.year, date.month, date.day).toLocaleDateString('en-US', options);
    }
}

export function tweetTime(date) {
    const options = {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    };

    const formattedDate = new Date(date).toLocaleDateString('en-US', options);

    const hours = new Date(date).getHours();
    const minutes = new Date(date).getMinutes();
    const format = hours >= 12 ? 'PM' : 'AM';
    const formattedTime = `${(hours % 12) || 12}:${minutes < 10 ? '0' : ''}${minutes} ${format}`;

    return `· ${formattedTime} · ${formattedDate} ·`;
}

  export const dayOptions = Array.from(Array(7), (_, i) => i)
  export const hourOptions = Array.from(Array(23), (_, i) => i)
  export const minuteOptions = Array.from(Array(59), (_, i) => i+1)