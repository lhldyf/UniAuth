define(['../../utils/constant', '../../utils/utils'], function (constant, utils) {
    /**
     * A module representing a User controller.
     * @exports controllers/User
     */
    var Controller = function ($rootScope, $scope, $location, UserService, dialogs, CommonService) {
        $scope.pagination = {
            pageSize: constant.pageSize,
            curPage: 1,
            totalCount: 0
        };

        //Event listeners
        $scope.queryUser = function () {

            var params = $scope.userQuery;

            if (!params) {
                params = {};
            }
            params.pageNumber = $scope.pagination.curPage - 1;
            params.pageSize = $scope.pagination.pageSize;

            $scope.users = [];
            $scope.usersLoading = constant.loading;

            UserService.getUsers(params, function (res) {
                var result = res.data;
                if(res.info) {
                    $scope.usersLoading = constant.loadError;
                    return;
                }
                if(!result) {
                    $scope.usersLoading = constant.loadEmpty;
                    return;
                }

                $scope.usersLoading = '';
                $scope.users = result.data;

                $scope.pagination.curPage = result.currentPage + 1;
                $scope.pagination.totalCount = result.totalCount;
                $scope.pagination.pageSize = result.pageSize;

            }, function () {
                $scope.users = [];
                $scope.usersLoading = constant.loadError;
            });
        };

        $scope.queryUser();

        $scope.launch = function(which, param) {
            switch(which) {
                case 'status':
                    var dlg = dialogs.create('views/common/dialogs/enable-disable.html','EnableDisableController',
                        {
                            "header":param.status?'用户-启用':'用户-禁用',
                            "msg":"您确定要" + (param.status?'启用':'禁用') + "用户: " + param.email + "吗?",

                        }, {size:'md'}
                    );
                    dlg.result.then(function (yes) {
                        UserService.enableDisableUser(
                            {
                                'id':param.id,
                                'status':param.status?0:1
                            }
                            , function(res) {
                                // status change successed
                                $scope.queryUser();
                            }, function(err) {
                                console.log(err);
                            }
                        );
                    }, function (no) {
                        // do nothing
                    });
                    break;
                case 'add':
                    var dlg = dialogs.create('views/user/dialogs/add.html','AddUserController',
                        {}, {size:'md'}
                    );
                    dlg.result.then(function (close) {
                        // add user successed
                        $scope.queryUser();
                    }, function (dismiss) {
                        //
                    });
                    break;
                case 'unlock':
                    var dlg = dialogs.create('views/common/dialogs/enable-disable.html','EnableDisableController',
                        {
                            "header":'解锁用户',
                            "msg":"您确定要解锁用户: " + param.email + "吗?",

                        }, {size:'md'}
                    );
                    dlg.result.then(function (yes) {
                        UserService.unlock(
                            {
                                'id':param.id
                            },
                            function(res) {
                                $scope.queryUser();
                            },
                            function(err) {
                                console.log(err);
                            }
                        );
                    }, function (no) {
                        // do nothing
                    });
                    break;
            }
        };

    };

    return {
        name: "UserController",
        fn: ["$rootScope", "$scope", "$location", "UserService", "dialogs", "CommonService", Controller]
    };

});