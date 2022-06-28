---
title: Glittertind
description: A simple app to track the progress of the hiking challenge at UiB
github: https://github.com/mrboen94/glittertind
---

![Splash image](/doc-images/glittertind/app-showcase/splash-image.png)
By Mathias Bøe and Christian Hein.

## Introduction

Every semester, Gnist, a subgroup of echo, organizes a competition where you earn points for hiking and working out outdoors. The main point of the competition is to activate the students as we move into the exam period, and the threshold for participation should be very low. Different scores are given for the different mountain peaks, depending on the height, length, and the terrain you have to walk through. Even if there are only two winners in the competition, one in the men's class and one in the women's class, it is still possible to win a number of prizes that are raffled off when the competition is over, and each point earned is converted into a lottery ticket. This helps the motivation of everyone, even those who do not have time to go extreme amounts of hiking. In our app we want to standardize how the tracking of each hike is done, and automatically give the correct amount of points to the user when a hike is done.

## Background

Currently, the entire competition is run through a Facebook group where you have to upload tracking maps with time stamps and an overview of where you have hiked, in addition to a photo you have taken on the mountain top to get the most points. Countless different apps have been used to track this information, ranging from Strava to Fitbit or Samsung Health, and the quality of tracking and the information you get from the various apps varies greatly. Therefore we will create one app for everything from tracking to scoring and taking photos, to gather everything in one place. We also want the points to be awarded automatically based on what has been tracked, so that the points earned are the same for everyone. In the Facebook group, some have tried to circumvent the rules to get as many points as possible for the shortest possible hike, and sometimes they have even succeeded because of a vague set of rules. Therefore, it is important that the points earned are the same for all participants, and that the rules are set by the organizers of the competition.

## Methodology

Figuring out what technologies we wanted to use was not an easy task. There are many different ways of developing apps today. Some are cross platform, others are native. In our app we need as much performance as we can get as we are rendering maps and collecting user position. Especially collecting user position can be power hungry, but so far in our tests the app isn't very power hungry compared to other apps such as the Norwegian Institute of Public Health's "Smittestopp" app. To get a real metric on this further testing is needed as our tests are just done on our iPhones so far.

We ended up with going for Flutter as it builds down to C/C++ and will in theory be more performant than other cross platform solutions such as React Native. Coding in Flutter also leads to cleaner code as we don't need to mix `html` and `javascript` in the same file.

### React Native vs. Flutter

Example of hello world in react native:

```js
import React from 'react'
import { Text, View } from 'react-native'

const HelloWorldApp = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text>Hello, world!</Text>
    </View>
  )
}
export default HelloWorldApp
```

As you can see it looks like react code, which is nice when developing websites, but working with both react native and react at the same time is really confusing and leads to language confusion. In general its more a question of taste as both frameworks offer much of the same capabilities.

```js
import 'package:flutter/material.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Welcome to Flutter',
      home: Scaffold(
        appBar: AppBar(
          title: const Text('Welcome to Flutter'),
        ),
        body: const Center(
          child: Text('Hello World'),
        ),
      ),
    );
  }
}
```

As you can see the code for flutter (dart) is pretty similar, so the difference is mostly based on taste and what you are most familiar with. You either go the route of developing the app as a `html` app. Or you go the route of flutter where you have different components with properties. It works the same and looks the same, but using components such as `card` which can have children as a prop, makes more sense to us than using `div` tags with the `className="card"` property just makes more sense to us. We can also just use googles material-ui to a develop fast and working app with app-bars (header) and layouts that makes sense.

We landed on flutter as having a strongly typed language and the ability to have null safety will lead to easier testing and hopefully more stability since it gives us compile errors if things are going wrong.

### Choosing the map provider

At first we used open street maps for our maps as it has community maps that are constantly being updated. But implementing them and customizing the visual elements are really hard compared to mapbox. Especially when adding support for multiple map tiles such as performance maps and dark mode.

So we ended with mapbox as our provider for maps as the ease of use made for a smoother and faster development cycle.

This also makes it easy to implement visualizations to these maps in the future. Mapbox is supported by a big company as well, so scalability has already been tested making our app able to scale well into the future.

### Choosing the database

Choosing the correct database for the data gathered can be hard, but for this project it was pretty self explanatory. Firebase excells in speed and the ability to scale it up as much as you want/can afford. Firebase also gives you crash reports in their console which is really helpful for diagnosing crashes or issues that the users experience without them having to actually report the issue. With all these features there aren't many good arguments for going with something else. There is an open source version of firebase available, but it is important for projects like this to have long time support, and that is not always the case with open source solutions.

### Data gathering and user information

Data gathering is always a sensitive issue, therefore this app only gathers the data absolutely necessary to support its features. Currently the app only gathers one datapoint from the user on the first login, that being the name associated with your google account.

Email is not stored in our firebase, same goes for all other information that we do not generate ourselves for the user.

A users data is saved like this:

```js
{
UID: "PasdgPWE23MFnmaSDOgpo2j6gNA51SD",
admin: true,
displaytruename: true,
hikes: {
  Array[
    "hikes/OcTt2K3yPWLf1bW72Wi4",
    "hikes/ntTt5p3yfEsgfiW72qis",
    "hikes/kUTtQn3yPWgf1bWi2shw",
    ...
    ],
  },
points: 15.5,
randomname: Synlig Joggesko,
registered: true,
username: "Ola Nordmann",
}
```

We currently do not track current total distance, but it is something we are looking into doing as it is a feature that feedback from users suggests will be appreciated.

Hikes are stored in a way such that the information only travel one way. The user has ownership over the hikes, not the other way around. If you delete your user we can keep the hike data (maybe add a checkbox to delete this data as well) for visualizations without infringing on GDPR issues.

None of the data we gather is shared to any third parties. But due to the login format we can not guarantee or say what google tracks in this app. They do not get any information from us, but we have no way of telling if google has access any of the data due to the google sign in.

## Design

First we designed our app with figma sketches, this early design is not representative for what the app currently looks like. The structure however is still mostly the same.

![Figma](/doc-images/glittertind/figma.jpg)

After meetings with our supervisor Eric, we came to the conclusion that we want the map to be the main view of our application. This means that when you open the app now you will be greeted with a login screen if you are not signed in, and if you are signed in you get straight into the map view, allowing you to start the hike as fast as possible without much hassle.

We have also opted for the simple solution of hikes, you just start the tracking and points get calculated after finishing a hike. There are no routes being drawn as of now (this is a plan for the future, but not relevant as of now), this is because we are not aiming to be a "find places to hike app" but rather a "get points for hiking" app. This might change sometime in the future, but as of now there is no point to change it.

We looked further into creating colors for our app and have used the Echo color palette as the app is aimed towards UiB and the hiking challenge that Echo organizes.
Therefore our app consists of these colors:

EchoYellow: `#F9C002`

![#F9C002](http://placehold.it/150x40/F9C002/FFFFFF?text=EchoYellow)

EchoBlue: `#238194`

![#55AEC2](http://placehold.it/150x40/238194/FFFFFF?text=EchoBlue)

EchoLightBlue: `#55AEC2`

![#55AEC2](http://placehold.it/150x40/55AEC2/FFFFFF?text=EchoLightBlue)

### Logo

Getting a logo right is always a hard task. Here are some of the logos we explored while trying to find something we were satisfied with. In the image below you can see some of the process involved when it came to figure out the basic shapes and colors to convey the message we wanted to. As well as making it as modern looking as possible.

![designprocess](/doc-images/glittertind/designprogress.png)

Further here are some examples on how it looks in icon form. The further down you go the closer you get to the final logo.

![glittertind](/doc-images/glittertind/final2.png)

The image below is how the icon could have looked in dark mode, but it doesn't have enough contrast to be a viable option as of now.

![glittertind](/doc-images/glittertind/final.png)

### Current design

With the current implementation our app looks like this:

![glittertind](/doc-images/glittertind/splash-image.png)

We switched from dark mode to light mode since viewing dark maps and UI elements when hiking out in the sun is suboptimal. Darkmode might be nice on the eyes during night time, but in daylight it makes the app unusable, at least on displays with low brightness or contrast ratio. It is not a problem for higher end phones, but not everyone can afford such devices and accessibility is something we have to think about when developing an app.

## Results

This project has resulted in an app with lots of features. Some of the most noteworthy will be presented in details here.

Our app is multiplatform, where the same Flutter code exports to both iOS and Android. This was an important point in our planning process, because we did not want to exclude anybody from the competition just because of having a different operating system and phone.

When opening the app for the first time, the user will be presented the Log In Screen, which contains the Glittertind logo in addition to a Google Sign In button. When signing in, the app will check if this user exist in the database, and if not, a new user will be created. During user creation, a name generator will be used to give the user a randomly generated nickname, which by default is the name presented on the leaderboard. The nickname gives the user semi-anonymity on the leaderboard, which may lead to users concerned about others hiking much more than themselves actually being able to attend a competition without needing to show everyone the amount of points he or she has.

When a user has successfully signed in, the user will be redirected to the main screen of the app; the Map Screen. Here, a map fills almost the whole screen, and the current user location is automatically being centered on the map. In the background while the map is loaded, a list of mountains eligible for bonus points are retreived from the database. If the user is located nearby some of the mountains in this lise, these locations will be highlighted on the map with a bright yellow circle around the geofenced area of the mountain peak.

On the lower part of the Map Screen, a button labeled "Start" is floating on top of the map, and pressing this button will create a new Hike item which will continuously be updated with information about the distance hiked, a list of geolocations with a corresponding list of elevations at each geopoint, start time, and points achieved so far during the hike. The duration of the current hike will be shown in the AppBar, and the current distance and points achieved will also be presented in a nice looking extension of the AppBar. When the user has started a tracking and begin moving, an admin-specified step-distance will control how far the distance between each sample point will be. For each step, a new geolocation will be saved to the Hike item, in addition to the current elevation. Using the list of geopoints visited, our local calculator will be used to automatically compute the points achieved. If entering a geofenced area, which means an area eligible for bonus points, the mountain-ID will be appended to the list of bonus point mountains visited, and the calculator will take into account the extra points given by visiting these mountains in addition to the distance already hiked.

When a hike is complete, pressing the "Stopp" button will start a process which uploads the collected data to the database. A new hike is stored with a unique ID, and a reference to the hike is stored with the user who created it. This makes it possible to keep the anonymized hiking data in the database even when a user is deleted or a user has deleted a certain hike, because a user owns a hike while the hike itself does not have an owner. When a hike is successfully uploaded to the database, the user is redirected to the Profile Screen.

The Profile Screen greets the user with a message containing the real name of the user, in addition to the randomly generated nickname and profile picture. A list of the user's hikes are also presented in a scrollable view, where metrics like the type of activity (hike or walk), date, points achieved, total duration, and distance traveled are shown. More noticable, a map visualizing the hike and a graph showing the height profile of the hike can also be seen here. In the map, all collected geopoints are painted onto the map, which provides a the ability to look back at where the user where hiking for the given hike. The height profile is created with the list of elevations at each geopoint, which results in a nice visualization of where the hike were more steep and challenging than the other parts of the same hike.

From the Profile Screen, the user can navigate to three different screens; back to the Map Screen, to the Settings Screen or to the Leaderboard Screen. The Leaderboard Screen features a list of all contenders in the current hiking challenge, sorted by points in descending order. For the sake of simplicity, the current user is also highlighted to show how he or she is doing compared to the others. The leaderboard might contain the real names of the contenders, but by default it presents only the nickname of the users. To present a user's real name, the user will need to navigate to the Settings Screen.

In the Settings Screen, the first setting presented gives the user an option for enabling or disabling real name previewing in the leaderboard. Toggling this will update the user profile in the database, signaling to everyone else in the competition that their name should be shown or hidden from the leaderboard. This leads to a streamlined presentation of the name or nickname, so that the leaderboard looks the same for all users.

One other setting we have implemented is the option for selecting the map theme. We have provided four different themes, two light ones and two dark ones. We have named them "Mørke farger" (dark colors) and "Lyse farger" (light colors), and each of them has a higher and lower quality mode. Switching between these will change the type of map shown in the Map Screen.

Many settings are stored locally on the device using the app, which makes it possible to remember which kind of map the app will render and if a user is logged in or not. If a user is logged in, the Map Screen will be presented instantly, and if not, the user will be redirected to the Log In Screen. The last "setting" in the Settings Screen is the "Logg ut" button, which will logout the user if pressed. This will de-authenticate the user and set the settings to default again. When opening the app again, the only screen visible until logging in again is the Log In Screen.

## Discussion

This app is probably the best solution currently out there for the _fjellturchallenge_ as it is specifically built for the challenge and makes it fairer when administrating points. Not all the rules have been implemented as they stand in the current rules, some of the rules are simply not necessary or just plain unfair when everyone has the same ruleset.

Some rules that are in play today say that you cannot visit the same place over and over for points. This is no longer a problem as we don't give the user any bonus points for going to the same mountaintop twice, but you still get the points for distance traveled. This is a fairer way to implement this rule as people shouldn't be discouraged to do more activity because they have already gone for a hike that day. The goal of this challenge is to make people move, so adding penalties for going on hikes make no sense.

### Problems

We had some issues implementing certain features such as open street maps (as discussed above) as well as a good geofencing technique. We finally landed on mapbox to solve our issues with the maps. Geofencing was a bit harder, but we did find a library for our geofencing that has some anti cheating implemented into it. It uses motion sensors in the phone to discover movement as well as geolocation, so spoofing of location is harder, as well as doing some checks on speed to figure out if users are driving or cycling.

Other than that, problems have mostly been project structure and a lot of refactoring to make sure we have clean and readable code.

## Future work

Before the app can be used for the _echo fjellturchallenge_, there are some important features which needs to be implemented first. One of the features on the Facebook group that makes it interesting to follow along the hikes of others in the competition, is the ability to post beautiful photos taking during the hike. A feature for making in-app photographing possible would be nice to have, and this would also lead to the need of a timeline for presenting the photos taking during a hike.

A social media timeline could look somewhat like the "Last Hikes" timeline we already have implemented on the profile screen, while also including the hikes of other users in the competition with their photos as well. To make sure every contender is behaving nicely and not posting explicit photos, having some administrators for each competition is important.

An administrator would have the power to remove photos not suitable for the timeline, and would of course be able to control which mountains are eligible for bonus points in the competition, when a certain hike would have double points, and for how long of a distance a contender would have to hike before retrieving points. Most of these features would be baked into an administrator panel, only visible for the ones maintaining and running a certain competition.

Anti cheating measures via NFC or bluetooth tags that hold some sort of keys that could be placed on certain mountain tops (If cheating were to be an issue). This could also be a great product to sell alongside the app if we want to bring this further into the commercial world.

Before this app is ready for any sort of use we need to lock down the user data better. Either encryption in the firebase or further anonymize the data. We will need to encapsulate the data somehow. Encryption might not be the "end all be all", but we for sure need to rewrite some database rules such that the users don't have the power to edit everyones data in the database.

A final feature that would be nice to have is the ability to randomly choose a given number of winners in the lottery, which also is done manually at this moment in the Facebook group.

The main problem that needs to be fixed before we start using the app however is proper database rules and a good structure that supports different user levels. This is a small issue that will take aproximately 10 hours to solve.

Apart from that the app is working as intended and is ready for use by the students at UiB for the fall semester of 2021.
