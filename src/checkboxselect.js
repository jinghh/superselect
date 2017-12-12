/**
 * 
 * @authors jinghh (mail@yours.com)
 * @date    2016-06-13 10:19:49
 * @version 
 *阿什顿发顺丰
 * 期望数据格式：
 *          [
                {"text":'重庆',"value":0,"name":"n1","checked":""},
                {"text":'成都',"value":0,"name":"n2","checked":""},
                {"text":'深圳',"value":0,"name":"n3","checked":""},
                {"text":'哈尔滨',"value":0,"name":"n4","checked":"checked"},
                {"text":'济南',"value":0,"name":"n5","checked":""}
            ];
 */

    $.fn.superSelect = function (option) {
        const $input = $(this);
        var $search,
            $p = $input.parent(), //input的父容器
            $show,//显示的下拉列表
            str='', //隐藏状态的数据来源
            count = $('.show_superSelect').length,//添加编号
            arr = option;
            $mask = $('<div class="mask_superSelect" data-superId='+count+' style="position:fixed;width:100%;height:100%;top:0;left:0;z-index:9999;display:none"></div>');
            $mask.appendTo($("body"));
            $input.data('superId',count);
        //将数组组成DOM元素
        str='<div class="show_superSelect" style="position:absolute;z-index:10000;" data-superId='+count+'><p><input class="text_superSelect " type="text" placeholder="输入关键字搜索"></p><div class="checkall_box"><label class="radio-inline checkbox  checkall_superSelect" style="display:block;"><input class="custom-checkbox" type="checkbox">全选</label></div>';
        for (var i = 0; i < arr.length; i++) {
            var data = arr[i];
            var checked=''
            if (data.checked || data.checked == true) {
                checked = 'checked'
            };
            var Str = '<div class="datanum"><label style="display:block;"><input type="checkbox"  value="'+data.value+'" name='+data.name+' '+checked+'>'+data.text+'</label></div>';
            str+=Str;
        };
        str+='<p class="nosuggest_superSelect" style="display:none;">无可选项</p></div>'
        $show = $(str);
        $show.appendTo($p);
        //input的父级必须是相对定位
        $p.css("position", "relative");

        //根据input的在页面中的位置给list定位(现获取输入框相对父级的位置)
        var pleft = getLocation($input[0]).left - getLocation($input.parent()[0]).left,
            ptop = getLocation($input[0]).top - getLocation($input.parent()[0]).top + $input.height() + 10;

        /*面板定位*/
        $show.css({top: ptop, left: pleft, display: 'none', width: $input.outerWidth()});
        $input.after($show);

        //显示之前做做的事如果是全部选中，则让全选按钮被选中
        function showbefore() {
            /**获取数据的个数（一个div一条数据）**/
            var $databox = $show.find("div:not(.checkall_box)");
            if ($databox.length == 0) { //如果没没有选项则隐藏全选按钮，显示no_suggest
                $show.find("div").remove();
                $show.find(".nosuggest_superSelect").show();
            }
            //如果是全选则全选按钮选中
            if ($databox.find("input:checked").length == $databox.find("input").length) {
                $show.find(".checkall_superSelect input[type = checkbox]").prop("checked", true);
            }
        }
        //去除浏览器的默认提示
        $input.attr({autocomplete: "off"}).unbind("click").bind("click", function () {
            $search = $show.find(".text_superSelect");
            $(this).val("");
            $(this).addClass("active");
            showbefore();
            $show.show();
            // $mask.show();此处$mask为最后一个mask故重新查找对应的mask
            $(".mask_superSelect").filter("[data-superId="+$(this).data('superId')+"]").show();
            // $(window).on("keyup",keyListener);
            $search.focus();
            var $form = $input.parents("form");
            //阻止表单提交
            $form.attr('onsubmit', 'return false;');
        });

        $show.find(".text_superSelect").on("keyup",keyListener);

        //键盘事件
        function keyListener(e) {    //按键事件,根据按键判断相应的事件
            var $active = $show.find("div.active");//被选中的div
            var $div = $show.find("div:visible");//可见的
            var index = $div.index($active);//获取具有active的元素在可见算中的index
            var len = $active.length;
            console.log(e.keyCode)
            switch (e.keyCode) {
                // case 9:
                //     $(".mask_superSelect").filter("[data-superId="+$input.data('superId')+"]").click();
                //     console.log($(".mask_superSelect").filter("[data-superId="+$input.data('superId')+"]"));
                //     break;//换行键
                case 13://回车
                    if($active.length > 0) {
                        $active.find("input")[0].click();
                    }
                    break;
                case 32://空格
                    if($active.length > 0) {
                        $active.find("input")[0].click();
                    }
                    // $show.find('.text_superSelect').val($.trim($show.find('.text_superSelect').val()));//去掉空格重行赋值
                    break;
                case 38: //上
                    if (len > 0) {
                        $active.removeClass("active");
                        $div.eq(index - 1).addClass("active").focus();
                    } else {
                        $div.eq($div.length).addClass("active").focus();
                    }
                    break;
                case 40:
                    if (len > 0) {  //下
                        $active.removeClass("active");
                        $div.eq(index + 1).addClass("active").focus();
                    } else {
                        $div.eq(0).addClass("active").focus();
                    }
                    break;
                default :
                 $active.removeClass("active");//用户输入文字的时候去掉标记的避免空格时改变选中状态
                    break;
            }
             autoTip(count);
            //再次获取可见的div个数
            if (e.keyCode == 9) { //如果是tab键则再执行下面代码，否则提示会一直显示
                return;
            }
            if ($show.find("div:visible").length == 0) {
                $show.find(".nosuggest_superSelect").show();
            } else {
                $show.find(".nosuggest_superSelect").hide();
            }
        }

        /**自动筛选,将不符合条件的隐藏**/
        function autoTip(num) {
            var val = $('[data-superid='+num+'] input[type=text]').val();
            val = $.trim(val);
            $show.find("div").each(function () {//如果当前div下的文本于输入的匹配则显示否则隐藏
                var reg = new RegExp(val, "img");
                var text = $.trim($(this).text());
                if (reg.test(text)) {
                    $(this).show();
                } else {
                    //如果他是被用户选中的就不让他隐藏
                    if ($(this).find("[type=checkbox]").prop("checked")) {
                        return;
                    } else {
                        $(this).hide();
                    }
                }
            })
        }
        
        /**全选按钮.如果是全选择让全不选中，否则全选**/
        $show.on("click", ".checkall_superSelect input", function () {
            var $checkbox = $show.find("div:not(.checkall_box)").find("input[type=checkbox]");
            if ($checkbox.filter(":checked").length == $checkbox.length) {//如果全部选中了，则让全不选中
                $show.find("input[type = checkbox]").prop("checked", false);
            } else {
                $show.find("input[type = checkbox]").prop("checked", true);
            }
        });

        //点击每个多选框判断是否全选
        $show.on("click", ".datanum [type = checkbox]", function () {
            var $checkbox = $show.find(".datanum [type = checkbox]");
            if ($checkbox.filter(":checked").length == $checkbox.length) {//如果全部选中了，则让全选选中
                $show.find(".checkall_box [type = checkbox]").prop("checked", true);

            } else {
                $show.find(".checkall_box [type = checkbox]").prop("checked", false);
            }
        });
        //点击这遮罩层关闭面板,并赋值
        $mask.mousedown(function (e) {
            //如果是全选让全选显示在输入框内,否则显示第一个被选中的多选框的文本
            if ($show.find(".checkall_superSelect").hasClass("checked")) {
                $input.val($show.find(".checkall_superSelect").text());
            } else {
                var $check = $show.find(":checked");
                var text = $show.find(":checked").eq(0).parent().text();
                if ($check.length > 1) {
                    $input.val(text)
                } else {
                    $input.val($show.find(":checked").eq(0).parent().text())
                }
            }
            $show.hide();
            $(this).hide();
            $input.removeClass("active");
            var $form = $input.parents("form");
            //阻止表单提交
            $form.removeAttr('onsubmit');
            //解绑window的键盘函数
            $(window).off("keyup",keyListener);
            //复原设置
            $show.find("div.active").removeClass("active");
            $show.find("div").show();
            $(".nosuggest_superSelect").attr("style","display:none");
            return false;
        })

        //获取元素文档中的位置
        function getLocation(element) {
            if (element == null)
                return null;
            var offsetTop = element.offsetTop;
            var offsetLeft = element.offsetLeft;
            while (element = element.offsetParent) {
                offsetTop += element.offsetTop;
                offsetLeft += element.offsetLeft;
            }
            var o = {};
            o.left = offsetLeft;
            o.top = offsetTop;
            return o;
        }
    }
