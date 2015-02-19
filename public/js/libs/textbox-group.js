setTimeout(function() {
  $(".input-group .form-control").on('focus', function() {
    $(this).parent().find(".input-group-addon").addClass("active");
  });
  $(".input-group .form-control").on('blur', function() {
    $(this).parent().find(".input-group-addon").removeClass("active");
  });
}, 1000);
