function doPost(e) {
  console.log("Invoke POST");
  var contents = JSON.parse(e.postData.contents);
  var actionType = contents.action.type;
  
  console.log(contents);
  if (actionType !== 'updateCard'){ return }
  
  var existsListAfter = contents.action.data.listAfter;
  if (!existsListAfter) { return }
  var listAfter = contents.action.data.listAfter.name;
  if (listAfter !== '完了' ){ return }
  
  var existsCard = contents.action.data.card;
  if ( !existsCard ) { return }
  
  var taskId = contents.action.data.card.id;
  var taskName = contents.action.data.card.name;
    
  if ( postToSlack(taskName) ) {
    console.log("SUCCESS: post to slack");
  } else {
    console.log("ERROR: failed to post to slack");
    return;
  }
  
  if ( doArchive(taskId) ) {
    console.log("SUCCESS: do archive");
  } else {
    console.error("ERROR: failed to do archive");
    return;
  }
   
  return;
}

function doGet() {
  console.log("Invoke GET");
  return HtmlService.createHtmlOutput("GET SUCCESS");
}


/**
 * Trelloのタスクカードをアーカイブする
 * @param {String} taskId タスクId
 * @return {Boolean} 実行結果 詳細はログを確認する
 */
function doArchive(taskId) {
  
  var scriptProp =  PropertiesService.getScriptProperties().getProperties();
  var TRELLO_KEY = scriptProp.TRELLO_KEY;
  var TRELLO_TOKEN = scriptProp.TRELLO_TOKEN;
  var url = scriptProp.TRELLO_UPDATE_CARD + "/" + taskId;
  var payload = { 
    'key' : TRELLO_KEY,
    'token' : TRELLO_TOKEN,
    'closed' : true,
  };
  var options = {
    'method' : 'put',
    'payload' : payload,
    'muteHttpExceptions' : true,
  };
  
  var response = UrlFetchApp.fetch(url, options);
  var responseCode = response.getResponseCode();
  var responseBody = response.getContentText();
  
  if ( responseCode === 200 ) {
    console.log("SUCCESS: do archive trello task ID %s", taskId);
    return true;
  } else {
    console.error("ERROR: do archive trello task ID %s", taskId);
    console.info("ResponseCode: %s", responseCode);
    console.info("ResponseBody: %s", responseBody);
  }
  return false;
}


/**
 * Slackにポストする
 * @param {String} taskName タスク名
 * @return {Boolean} 実行結果 詳細はログを確認する
 */
function postToSlack(taskName) {
  
  var scriptProp =  PropertiesService.getScriptProperties().getProperties();
  var url = scriptProp.SLACK_POST_URL;
  var payload = {"text" : taskName + "を達成したよ！  " + createSlackLink(createTweetMsg(templateMsg(taskName)), 'つぶやく')}
  var options = {
    'method' : 'post',
    'payload' : JSON.stringify(payload),
    'muteHttpExceptions' : true,
  };
    
  var response = UrlFetchApp.fetch(url, options);
  var responseCode = response.getResponseCode();
  var responseBody = response.getContentText();
  
  if (responseCode === 200 ) {
    console.log("SUCCESS: post Slack of %s", taskName);
    return true;
  } else {
    console.error("ERROR: post Slack of %s", taskName);
    console.info("ResponseCode : %s", responseCode);
    console.info("ResponseBody : %s", responseBody);
  }
  return false;
}


/**
 * Twitterアプリ用のリンクを作成する
 * @param {String} msg : URLエンコード済みのメッセージ
 * @return {String} Twitterリンク
 */
function createTweetMsg(encodedMsg) {
 
  return  "twitter://post?message=" + encodedMsg;
  
}

/**
 * テンプレートに埋め込む
 * @param {String} taskName : Trelloタスク名
 * @return {String} テンプレートに埋め込んだメッセージ
 */
function templateMsg(taskName) {
  
  return "Trelloの導きにより「" + taskName + "」を達成した！";
  
}

/**
 * Slack用のリンクを作成する
 * @param {String} link : リンク
 * @param {String} linkName : 表示するリンク名
 * @return {String} slack用のリンク
 */
function createSlackLink(link, linkName) {
 return "<" + link + "|" + linkName + ">"
}

