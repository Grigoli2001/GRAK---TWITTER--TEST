import React from "react";

// icons
import { CiUser } from "react-icons/ci";
import { GoKey } from "react-icons/go";
import { FiDownload } from "react-icons/fi";
import { LiaHeartBrokenSolid } from "react-icons/lia";
import { PiLockKey } from "react-icons/pi";
import { HiOutlineDuplicate } from "react-icons/hi";
import { HiArrowsRightLeft } from "react-icons/hi2";
import { IoPeopleOutline } from "react-icons/io5";
import { PiUsersThree } from "react-icons/pi";
import { LuPencilLine } from "react-icons/lu";
import { PiComputerTower } from "react-icons/pi";
import { BiVolumeMute } from "react-icons/bi";
import { SlEnvolope } from "react-icons/sl";
import { RiMic2Line } from "react-icons/ri";
import { TbUserSearch } from "react-icons/tb";
import { BsArrowUpRightSquare } from "react-icons/bs";
import { PiCookieLight } from "react-icons/pi";
import { TbActivityHeartbeat } from "react-icons/tb";
import { IoLocationOutline } from "react-icons/io5";
import { CiSliderHorizontal } from "react-icons/ci";
import { MdOutlineSpeakerPhone } from "react-icons/md";
import { FiEyeOff } from "react-icons/fi";
import { PiPaintBrush } from "react-icons/pi";
import { GiWorld } from "react-icons/gi";
import { CgLoadbarSound } from "react-icons/cg";
import { BsUniversalAccessCircle } from "react-icons/bs";



let AccountOptions = [
    {
        title: 'Account Information',
        text: 'See your account information like your phone number and email address.', 
        icon: <CiUser/>,
        url: 'info'

    }, 
    {
        title: 'Change your password',
        text: 'Change your password at any time.', 
        icon: <GoKey/>,
        url: 'change', 
    }, 
    {
        title: 'Download an archive of your data',
        text: 'Get insights into the type of information stored for your account.', 
        icon: <FiDownload/>,
        url: 'archive'
    }, 
    {
        title: 'Deactivate your account',
        text: 'Find out how you can deactivate your account.', 
        icon: <LiaHeartBrokenSolid/>,
        url: 'deactivate'
    }, 
]


let SecurityOptions = [

    {
        title: 'Security',
        text: "Manage your account's security.", 
        icon: <PiLockKey/>,
        url: 'security'

    }, 
    {
        title: 'Apps and sessions',
        text: 'See information about when you logged into your account and the apps you connected to your account.', 
        icon: <HiOutlineDuplicate/>,
        url: '#', 
    }, 
    {
        title: 'Connected accounts',
        text: 'Manage Google or Apple accounts connected to X to log in.', 
        icon: <HiArrowsRightLeft/>,
        url: 'connected'
    }, 
    {
        title: 'Delegate',
        text: 'Manage your shared accounts.', 
        icon: <IoPeopleOutline/>,
        url: 'delegate'
    }, 
]

let PrivacyOptionsOne = [

    {
        title: 'Audience, media and tagging',
        text: "Manage what information you allow other people on X to see.", 
        icon: <PiUsersThree/>,
        url: '#'

    }, 
    {
        title: 'Your posts',
        text: 'Manage the information associated with your posts.', 
        icon: <LuPencilLine/>,
        url: '#', 
    }, 
    {
        title: 'Content you see',
        text: 'Decide what you see on X based on your preferences like Topics and interests', 
        icon: <PiComputerTower/>,
        url: '#'
    }, 
    {
        title: 'Mute and block',
        text: 'Manage the accounts, words, and notifications that you’ve muted or blocked.', 
        icon: <BiVolumeMute/>,
        url: '#'
    }, 
    {
        title: 'Direct Messages',
        text: 'Manage who can message you directly.', 
        icon: <SlEnvolope/>,
        url: '#'
    }, 
    {
        title: 'Spaces',
        text: 'Manage who can see your Spaces listening activity', 
        icon: <RiMic2Line/>,
        url: '#'
    }, 
    {
        title: 'Discoverability and contacts',
        text: 'Control your discoverability settings and manage contacts you’ve imported.', 
        icon: <TbUserSearch/>,
        url: '#'
    }, 
]

let PrivacyOptionsTwo = [
    {
        title: 'Ads preferences',
        text: 'Manage your ads experience on X.',
        icon: <BsArrowUpRightSquare/>,
        url: '#'
    },
    {
        title: 'Cookie preferences',
        text: 'Manage your cookie experience on X.',
        icon: <PiCookieLight/>,
        url: '#'
    },
    {
        title: 'Inferred identity',
        text: 'Allow X to personalize your experience with your inferred activity, e.g. activity on devices you haven’t used to log in to X.',
        icon: <TbActivityHeartbeat/>,
        url: '#'
    },
    {
        title: 'Data sharing with business partners',
        text: 'Allow sharing of additional information with X’s business partners.',
        icon: <HiArrowsRightLeft/>,
        url: '#'
    },
    {
        title: 'Location information',
        text: 'Manage the location information X uses to personalize your experience.',
        icon: <IoLocationOutline/>,
        url: '#'
    },
]

let NotificationOptions = [
    {
        title: 'Filters',
        text: 'Choose the notifications you’d like to see — and those you don’t.',
        icon: <CiSliderHorizontal/>,
        url: 'filters'
    },
    {
        title: 'Preferences',
        text: 'Select your preferences by notification type.',
        icon: <MdOutlineSpeakerPhone/>,
        url: 'preferences'
    },
]

let AccessibilityOptions = [
    {
        title: 'Accessibility',
        text: 'Manage aspects of your X experience such as limiting color contrast and motion.',
        icon: <FiEyeOff/>,
        url: '#'
    },
    {
        title: 'Display',
        text: 'Manage your font size, color, and background. These settings affect all the X accounts on this browser.',
        icon: <PiPaintBrush/>,
        url: '#'
    },
    {
        title: 'Languages',
        text: 'Manage which languages are used to personalize your X experience.',
        icon: <GiWorld/>,
        url: '#'
    },
    {
        title: 'Data usage',
        text: 'Limit how X uses some of your network data. These settings affect all the X accounts on this browser.',
        icon: <CgLoadbarSound/>,
        url: '#'
    },
    {
        title: 'Keyboard shortcuts',
        text: '',
        icon: <BsUniversalAccessCircle/>,
        url: '#'
    },

]

export function getPrivacyOptionsTwo() {
    return PrivacyOptionsTwo;
}

export function getPrivacyOptionsOne() {
    return PrivacyOptionsOne;
}

export function getAccountOptions() {
    return AccountOptions;
}

export function getSecurityOptions() {
    return SecurityOptions;
}

export function getNotificationOptions() {
    return NotificationOptions;
}

export function getAccessibilityOptions() {
    return AccessibilityOptions;
}