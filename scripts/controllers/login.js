Controllers.controller("LoginCtrl",
    ["$scope", "$http", "$rootScope", "$location", "$timeout", "Connection", "User", "Channel", "Parser",
    function ($scope, $http, $rootScope, $location, $timeout, Connection, User, Channel, Parser)
    {
        $scope.user = User.get("~");

        $location.hash("");

        $http.jsonp("http://freegeoip.net/json/?callback=JSON_CALLBACK").success(function (data)
        {
            $scope.user.country = data.country_name;
            $scope.user.flag = data.country_code;
        });

        $scope.login = function ()
        {
            //var cs = Channel.register("#Coldstorm");
            //var two = Channel.register("#2");

            var test = Channel.register("#test");

            var hostToken = "";

            $http.jsonp("http://coldstorm.tk/fixip.php?nick=" +
                encodeURI($scope.user.nickName) + "&random=" +
                Math.floor(Math.random()*10000000));

            hostToken = md5($scope.user.nickName);

            Connection.connect("ws://coldstorm.tk:81");

            Connection.onOpen(function ()
            {
                Connection.send("NICK " + $scope.user.nickName);
                Connection.send("USER " +
                    $scope.user.color.substring(1).toUpperCase() +
                    $scope.user.flag + " - - :New coldstormer");

                Connection.onWelcome(function ()
                {
                    if ($scope.user.password)
                    {
                        Connection.send("PRIVMSG NickServ :identify " +
                            $scope.user.password);
                    }

                    if (hostToken)
                    {
                        Connection.send("PRIVMSG Jessica :~fixmyip " +
                            hostToken);
                    }

                    test.join();
                });
            });

            Connection.onMessage(function (message)
            {
                Parser.parse(message);
            });

            Connection.onClose(function ()
            {
                console.log("Closed");
            });

            $location.path("/channels/#test");
        };
    }]);
