class Activity {
  constructor(activityData) {
    this.activityData = activityData
  }

  getUserInfoByDateAndId(id, date) {
    return this.activityData.find(data => id === data.userID && date === data.date);
  }

  getMilesFromStepsByDate(id, date, userRepo) {
    let userStepsByDate = this.getUserInfoByDateAndId(id, date);
    return parseFloat(((userStepsByDate.numSteps * userRepo.strideLength) / 5280).toFixed(1));
  }

  getActiveMinutesByDate(id, date) {
    let userActivityByDate = this.getUserInfoByDateAndId(id, date);
    return userActivityByDate.minutesActive;
  }

  calculateActiveAverageForWeek(id, date, userRepo) {
    return parseFloat((userRepo.getWeekFromDate(date, id, this.activityData).reduce((acc, elem) => {
      return acc += elem.minutesActive;
    }, 0) / 7).toFixed(1));
  }

  accomplishStepGoal(id, date, userRepo) {
    let userStepsByDate = this.getUserInfoByDateAndId(id, date);
    return userStepsByDate.numSteps === userRepo.dailyStepGoal ? true : false;
  }

  getDaysGoalExceeded(id, userRepo) {
    return this.activityData
      .filter(data => id === data.userID && data.numSteps > userRepo.dailyStepGoal)
      .map(data => data.date);
  }

  getStairRecord(id) {
    return this.activityData
      .filter(data => id === data.userID)
      .reduce((acc, elem) => (elem.flightsOfStairs > acc) ? elem.flightsOfStairs : acc, 0);
  }

  getAllUserAverageForDay(date, userRepo, relevantData) {
    let selectedDayData = userRepo.chooseDayDataForAllUsers(this.activityData, date);
    return parseFloat((selectedDayData.reduce((acc, elem) => acc += elem[relevantData], 0) / selectedDayData.length).toFixed(1));
  }

  userDataForToday(id, date, userRepo, relevantData) {
    let userData = userRepo.getDataFromUserID(id, this.activityData);
    return userData.find(data => data.date === date)[relevantData];
  }

  userDataForWeek(id, date, userRepo, releventData) {
    return userRepo.getWeekFromDate(date, id, this.activityData).map((data) => `${data.date}: ${data[releventData]}`);
  }

  // Friends
  getFriendsList(user, userRepo) {
    let data = this.activityData;
    return user.friends.map(friend => {
      return userRepo.getDataFromUserID(friend, data);
    });
  }

  getFriendsActivity(user, userRepo) {
    let friendsDatalist = this.getFriendsList(user, userRepo);
    return friendsDatalist.reduce((listOfFriends, friend) => {
      return listOfFriends.concat(friend);
    }, []);
  }

  getFriendsAverageStepsForWeek(user, date, userRepo) {
    let friendsActivity = this.getFriendsActivity(user, userRepo);
    let timeline = userRepo.chooseWeekDataForAllUsers(friendsActivity, date);
    return userRepo.combineRankedUserIDsAndAveragedData(friendsActivity, date, 'numSteps', timeline);
  }

  showChallengeListAndWinner(user, date, userRepo) {
    let rankedList = this.getFriendsAverageStepsForWeek(user, date, userRepo);

    return rankedList.map(stepsById => {
      let userID = Object.keys(stepsById)[0];
      let userName = userRepo.getDataFromID(parseInt(userID)).name;
      return `${userName}: ${stepsById[userID]}`
    });
  }

  showcaseWinner(user, date, userRepo) {
    let namedList = this.showChallengeListAndWinner(user, date, userRepo);
    let winner = this.showChallengeListAndWinner(user, date, userRepo).shift();
    return winner;
  }

  filterUserSortedArray(userArray, relevantData) {
    return userArray.filter((user, index) => {
      if (index >= 2) {
        return (userArray[index - 2][relevantData] < userArray[index - 1][relevantData]
          && userArray[index - 1][relevantData] < userArray[index][relevantData]);
      }
    });
  }

  getStreak(userRepo, id, relevantData) {
    let data = this.activityData;
    let sortedUserArray = (userRepo.makeSortedUserArray(id, data)).reverse();
    let streaks = this.filterUserSortedArray(sortedUserArray, relevantData);
    return streaks.map(streak => {
      return streak.date;
    });
  }

  getWinnerId(user, date, userRepo) {
    let rankedList = this.getFriendsAverageStepsForWeek(user, date, userRepo);
    let idList = rankedList.map(stepsById => Object.keys(stepsById));
    return parseInt(idList[0].join(''));
  }
}



export default Activity;
