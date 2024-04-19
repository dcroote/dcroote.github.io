---
layout: post
title: Analyzing Mio Fuse heart rate data in Python
image: images/hr_5_activities.png
image-alt: Activity-dependent heart rate
comments: true
---

I have been using the <a href="http://www.mioglobal.com/Mio-FUSE-Heart-Rate-Training-Activity-Tracker/Product.aspx" target="_blank">Mio Fuse</a> (similar to a Fitbit Charge HR) for a couple months now and I wanted to illustrate how to perform your own data analysis on raw heart rate data extracted from the device.

If you have considered purchasing a Mio product, you have probably also observed that the companion Android and iPhone apps have a number of negative user reviews. Many people appear to have sync issues, while others bemoan the limited functionality of the app. Fitbit heart rate monitoring devices are an alternative; however, they appear to perform poorly during high intensity exercise (try searching Google for <a href="https://www.google.com/search?q=fitbit%20heart%20rate%20high%20intensity" target="_blank">fitbit heart rate high intensity</a>) and you apparently <a href="https://community.fitbit.com/t5/Fitbit-com-Dashboard/Download-HeartRate-data/td-p/1212798" _target="blank">cannot access the raw heart rate data without a Fitbit developers account</a>.

I ended up taking a leap of faith with the Mio Fuse and have had an overwhelmingly positive experience thus far!

Before we begin, does the following apply to other Mio products besides the Fuse, such as the Mio Link, Mio Velo, or Mio Alpha 2? Potentially, but it depends on if there are any differences in data storage between devices. Since all devices use the same app, this process is likely this will work, but if you have one of these devices try this out and let us know in the comments!

## What you will need:

- On your phone:
  - App: <a href="https://play.google.com/store/apps/details?id=com.mioglobal.android.miogo&hl=en">Mio GO</a> (free)
  - App: <a href="https://play.google.com/store/apps/details?id=com.estrongs.android.pop&hl=en">ES File Explorer</a> (free)
- On your computer
  - Python virtual environment (I use <a href="https://www.continuum.io/why-anaconda">Anaconda</a>) that includes the packages such as `seaborn`, `pandas`, and `matplotlib`

## Setup instructions

### 1) Workout while recording heart rate

- To begin recording your heart rate hold the middle button until FIND appears
- Press the middle button once your heart rate is being displayed. GO should appear.
- Once your workout is complete, hold the middle button until PAUSE appears.
- Hold it again until QUIT appears.

### 2) Sync the workout data to your phone using the Mio GO app

With bluetooth enabled, open the Mio Go app, wait until the device is found, and sync your workout by swiping down on the screen. "SYNC" should appear on the device.

### 3) Change the name of the workout

This will allow us to extract heart rate and other data relevant to this workout.

- Select the workout that was just sync'd
- Under Edit, select a listed activity or type in your own description; as a habit I avoid spaces and stick to alphanumeric characters.
- Hit Back and the workout description should be updated with the new name.

### 4) Find and transfer the logfile created by the Mio GO app to your computer

- _This part may vary by phone model_
- On my phone (Motorola Moto X (1st gen), Android 5.1), the logs appear under /sdcard/MioLogs/
- Browse to this folder using the ES File Explorer app
- Send the logfile (which will be named according to today's date in the format DD-MM-YYYY.log) to your computer. I find it easiest to select the logfile (click and hold), hit the Options button in the upper right (three vertical dots) and send it to one of my email addresses using the Share option.

## Loading the data

The logfile is structured as a simple text file, where each line corresponds to a daily activity log, workout log, or other device action. To extract workout data, the following simple python function loops through each line of the text file looking for the description we gave our workout in Step 3. Because each workout actually appears more than once in the log (when created, when updated, etc...), the function looks for the words "WorkoutData" and "updateWorkoutData" in the same line as the activity description.

<pre><code class="language-python">def load_workout_json_from_file(logfile, activity_name=None):
    """ Returns Mio Fuse (and other Mio HR products?) workouts as a list of dictionary objects """
    workouts = []
    with open(logfile) as f:
            for line in f:
                if 'WorkoutData:' in line and 'updateWorkoutData' in line:
                    json_start = re.search("WorkoutData:", line)
                    workout_dict = json.loads(line[len('WorkoutData:')+json_start.start():])
                    if activity_name is not None:
                        if "otherActivityDesc" in workout_dict and workout_dict["otherActivityDesc"] == activity_name:
                            workouts.append(workout_dict)
                    else:
                        workouts.append(workout_dict)
    return workouts
</code></pre>

### Data structure

In each workout dictionary object, there is a wealth of data:

<pre><code class="language-python">{
    u'aHR': 51,
    u'avghrs': 51,
    u'avgpaces': 0,
    u'avgspeeds': 0,
    u'baseId': -1,
    u'bestTime': 0,
    u'calorie': 0,
    u'date': u'2016-05-28T00:15:24-07:00',
    u'day': 28,
    u'dist': 0,
    u'elevation': 0.0,
    u'exerciseHour': 0,
    u'exerciseMinute': 5,
    u'exerciseSecond': 7,
    u'googleMapsPolylies': [],
    u'heartRateArray': [49, 49, 50], # abbreviated here for simplicity
    u'hour': 0,
    u'icontype': 17,
    u'id': 0,
    u'isEdit': False,
    u'lapIndex': 0,
    u'lapSummary': 0,
    u'maxSpeed': 0,
    u'maxhrs': 61,
    u'maxpaces': 0,
    u'maxspeeds': 0,
    u'minute': 15,
    u'month': 5,
    u'name': u'',
    u'otherActivityDesc': u'Sitting',
    u'recordType': 0,
    u'second': 24,
    u'step': 0,
    u'tag': u'BaseData',
    u'timeInZone': 0,
    u'timeInZone1': 0,
    u'timeInZone2': 0,
    u'timeInZone3': 0,
    u'timeInZone4': 0,
    u'timeInZone5': 0,
    u'totalLapAmount': 0,
    u'type': 1,
    u'value': u'',
    u'workOutTypeEx': 1,
    u'workoutType': 0,
    u'year': 2016,
    u'zone1LowerLimit': 97,
    u'zone2LowerLimit': 116,
    u'zone3LowerLimit': 135,
    u'zone4LowerLimit': 155,
    u'zone5LowerLimit': 174
}
</code></pre>

## Analyzing the data:

### Heart rate vs. exercise intensity

I thought it would be interesting to plot my how my heart rate varied when performing 5 different activities of increasing intensity. For each activity I performed 3 replicates, each for five minutes. I attempted to allow enough time in between replicates for my heart rate to return to a somewhat stable value (ideally resting), but as you can tell from the plot below, I was a bit impatient. The time series plot below was created using the python package `seaborn` where the shading along each curve represents the 68% confidence interval for my heart rate at a given time.

<img class="centered_img" src="/images/hr_5_activities.png" alt="[img] Heart rate time series for 5 activities" />

We can draw a couple of conclusions from the data. From analyzing 15 minutes of sitting data, my resting heart rate is about 55 beats per minute. Unsurprisingly, it takes longer to reach a steady state heart rate for more intense activities. Also, although we cannot draw a conclusion about true accuracy of the heart rate data (without a chest strap, for example), qualitatively the precision is quite good even for higher intensities.

### Step count vs. distance

Another question I had was how the Mio steps count compared to the distance estimate. Na&iuml;vely, we could plot all of the points from the walking, jogging, and running trials and look at the correlation, as shown below.

<img class="centered_img" src="/images/steps_vs_dist.png" alt="[img] Correlation between steps and distance" />

<pre><code class="language-python">LinregressResult(
    slope=1.4623468919589022,
    intercept=-400.55741174998468,
    rvalue=0.99251466374373298,
    pvalue=1.1860742005338232e-07,
    stderr=0.068009702466414801
)
</code></pre>

As expected, steps and distance correlate well, with an R<sup>2</sup> value of 0.985. However, if we look a little closer at the linear regression, we see that the intercept is -400, which is to say that if we take no steps, the estimated distance is -400 meters. Clearly, something isn't right. The assumption in performing this linear correlation is that the distance covered per step is constant. However, if we consider the three activities that contributed data: walking, jogging, and running, this is not true: stride length during running is certainly greater than walking. Consequently, I performed a number of additional trials for each activity in which I varied the number of steps. By plotting a linear regression for each activity, rather than for all activities combined, we can see that indeed stride length is different (as measured by the slope of each line).

<img class="centered_img" src="/images/steps_vs_dist_by_activity.png" alt="[img] Correlation between steps and distance by activity" />

Interestingly, this outcome suggests that my stride length during running and jogging is approximately equivalent, an outcome that is plausible, but one I am slightly suspicious of. One way to test this is to perform each activity on a track over a known distance, counting the number of steps manually. However, that set of experiments is fitting for another post that can simultaneously address questions of Mio distance estimation accuracy.

That's all for now. I hope that this tutorial is helpful and that these examples illustrate just a few ways in which you can analyze your own Mio activity data.
<br />

## If you have found this useful or have suggestions, let me know in the comments!
