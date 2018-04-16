'use strict';

app.controller('UpdatePasswdCtrl', ['$scope', '$state', '$http', function ($scope, $state, $http) {
    var token = localStorage.getItem('token');
    var id = localStorage.getItem('id');
    var url = usersUri + '/' + id + '/password';
    $scope.data = {};
    $scope.update = function () {
        if($scope.data.password!=$scope.data.confirm_password){
            $scope.error('新输入密码验证失败');
            return;
        }
        $http.post(url, $scope.data, {
            params:{
                token: token
            }
        }).success(function(result){
            var obj = result;
            if(obj.err){
                $scope.error(obj.msg);
            }else{
                $scope.success('操作成功');
                $scope.data = {};
                $state.go('access.signin');
            }
        }).error(function(msg, code){
            $scope.errorTips(code);
        });
    };
}]);
