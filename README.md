# trello2slack

Google Apps Script上で、Trelloの"完了"リストに配置したタスクを検知して、Slackに投稿します

## Getting Started

### Prerequisites

以下のアカウントを準備してください

- Google Apps Script(以下、GAS)利用のためのGoogle アカウント
- 投稿先のSlack アカウント
- フック元の Trello アカウント

### Installing 

1. GASを公開し、URLを取得する

    main.gsを作成し、
    "公開" > "ウェブアプリケーションとして導入" > 画面の指示に従い、公開  
    このとき、公開範囲を"全員"にする  
    公開されたURL(以下、GAS_URL)を取得する

2. Trello API のトークンを取得する

    https://trello.com/1/appKey/generate  
    ここからAPIキー(以下、TRELLO_KEY)を取得する(メモする)  
    https://trello.com/1/authorize?key=${TRELLO_KEY}&name=&expiration=never&response_type=token&scope=read,write  
    案内に従い、APIトークン(以下、TRELLO_TOKEN)を取得する(メモする)  
    > トークンの期限は無期限、READ,WRITE権限になっているので、必要に応じて見直してください

3. TrelloのボードIDを取得する

    Trelloのユーザ名(以下、TRELLO_USER)を確認した上で、APIを叩く。  
    GASを使うときは以下の通り。
    ログに出力されるので、name属性から該当のボードを
    見つけて、ボードID(以下、TRELLO_BOARD)を取得する

    <pre>
    function getBoardId() {
        var url = 'https://trello.com/1/members/'
        + 'TRELLO_USER'
        + '/boards?fields=id,name&key='
        + 'TRELLO_KEY'
        + '&token='
        + 'TRELLO_TOKEN';
        var options = {
            'method': 'get',
        };
        Logger.log(UrlFetchApp.fetch(url, options));
    }
    </pre>

4. TrelloのWebhookを設定する

    GASを使うときは以下の通り。
    ログで "active": trueが含まれればOK。  
    この設定以降、Trelloで操作する限り、webhookが動作して、GASのURLが呼ばれる
    
    <pre>
    function createWebhook() {
        var url = 'https://api.trello.com/1/tokens/' + 'TRELLO_TOKEN' + '/webhooks/?key=' + 'TRELLO_KEY'
        var options = {
            'method' : 'post',
            'payload' : {
                'description': 'this webhook description',
                'callbackURL': 'GAS_URL',
                'idModel': 'TRELLO_BOARD'
            }
        };
        Logger.log(UrlFetchApp.fetch(url, options));
    }
    </pre>

5. Slackの投稿を可能にする

    該当のSlackチャネルに対して、IncomingWebhookを設定する  
    Webhook URL(以下、SLACK_URL)を取得する

6. main.gsを書き換える

    本プロジェクトのmain.gsで上書きする。  
    またプロパティを設定する。  
    設定するスクリプトのプロパティは以下の通り。  
    ${}で囲んでいる箇所はこれまでメモした値を入れる

    |プロパティ名|値|
    --|--
    |TRELLO_UPDATE_CARD|https://api.trello.com/1/cards|
    |SLACK_POST_URL|${SLACK_URL}|
    |TRELLO_TOKEN|${TRELLO_TOKEN}|
    |TRELLO_KEY|${TRELLO_KEY}|
    |TRELLO_BOARD_ID|${TRELLO_BOARD}|

7. GASの公開

    "公開" > "ウェブアプリケーションとして導入" > 新しい版で公開する  
    このとき公開範囲を"全員(匿名を含む)"にする

8. 動作確認

    Trelloにて、該当ボードのタスクを'完了'リストに追加して、Slackへの投稿 + タスクがArchiveされることを確認してください
    > ログは Stackdriver Loggingで確認できます

### Acknowledgments
- Twitterリンクは、Androidスマートフォンからの操作しか動作しません
- Slackに投稿する内容を変えたい場合は postToSlack functioあたりを変更すると良いです
- '完了'リストの判定が日本語なので、日本語でないユーザーやリスト名が異なる場合は動作しません

