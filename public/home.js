//global variables
var mouse = {x: 0, y: 0}
print = console.log //because print() is easier to type than console.log()
previousPages = []
isSelecting = false

jQuery(function($) {
$(document).ready(function() {
  $('#file').change(function() {// the function allows files to be uploaded						
    if ($('#file')[0].files.length != 0) {
      var myFormData = new FormData()
      myFormData.append('file', $('#file')[0].files[0]) //add file to request
      $.ajax({
        url: '/api',
        type: 'POST',
        processData: false, // important
        contentType: false, // important
        dataType : 'json',
        data: myFormData,
        complete: function(_, success) {
          print(success)
          initDirectory(rootPath)
        }
      })
    }
  })
  $('dialog').each(function(_, dialog) {
    dialogPolyfill.registerDialog(dialog) //allow use of <dialog> on non-desktop-chrome browsers
  })
  $('body').swipe(function() {//action that can be used to hide menu with a swipe 
    hideContextMenu()
  })
  
  $('#more').unbind('click').click(function(e) {
    var path = previousPages[previousPages.length - 1]
    contextMenu('page', e, path)
  })
  $('main').scroll(function() {
    hideContextMenu()
  })
  $('#select').unbind('click').click(function() {
    //toggle selection mode
    isSelecting = !isSelecting
    
    if (isSelecting === true) {
      $('#select').find('i').text('block')
      //nice animation for hide/show
      $('.moreButton').each(function(index, element) {
        $(element).slideUp()
      })
      setTimeout(function() {
        $('.selectionBox').each(function(index, element) {
          $(element).slideDown()
        })
      }, 400)
        
      //change context menu for top menu
      $('#more').unbind('click').click(function(e) {
        contextMenu('selection', e)
      })
    }
    else {
      $('#select').find('i').text('add_circle_outline')
      //nice animation for hide/show
      $('.selectionBox').each(function(index, element) {
        $(element).slideUp()
      })
      setTimeout(function() {
        $('.moreButton').each(function(index, element) {
          $(element).slideDown()
        })
      }, 400)
      //change context menu for top menu
      $('#more').unbind('click').click(function(e) {
        var path = previousPages[previousPages.length - 1]
        contextMenu('page', e, path)
      })
    }
  })

  setTimeout(function() {
    $('.mdl-layout__tab-bar-button').remove()
  }, 250)
  
  document.oncontextmenu = function() {
    return false //disable native right click
  }
  $('body').tap(function(e) {
    $(document).click(e) //tap == click
  })
  $(document).click(function(e) {
    var list = []
    $('.mdl-button--icon').each(function(index, element) {
      list.push(element.outerHTML)//
    })
    var clicked = $(document.elementFromPoint(e.pageX, e.pageY))
    if (!list.includes(clicked[0].outerHTML) && !list.includes(clicked.parent()[0].outerHTML)) {
      hideContextMenu()
    }
  })
  
  function hideContextMenu() {// hides the context menu 
    $('.contextMenu').each(function(_, item) {
      $(item).slideUp('fast')
    })
  }
  
  $('#back').click(function() {
    previousPages.splice(previousPages.length - 1, 1) //delete current page from history
    var path = previousPages[previousPages.length - 1] //get last page path
    initDirectory(path) //init
  })
  
  $('#home').click(function() {
    initDirectory(previousPages[0]) //go back to root/home directory
  })

  function initPath(path) { // a function for the navigation menu to indicate which file you are on 
    $('main').unbind('contextmenu').contextmenu(function(e) {
      contextMenu('page', e, path)
    })
    if (previousPages[previousPages.length - 1] != path) {// get previous flies to current 
      previousPages.push(path)// using the back button to navigate to previous file
    }
    
    $('.tab').remove() //using jquery to remove a tab, clearing out previous tabs
    $('.arrow').remove() // when going to a prevous file the arrow get removed, it's just for design
    var pathArray = (path.includes("/")) ? path.split("/") : path.split("\\")// a cross platform for windows and mac for file paths 
    pathArray.forEach(function(element, i) {
      if (element != "") { // adding a new tab to navigation 
        var html = `
        <a class="mdl-layout__tab tab">${element}</a> 
        <a class="arrow" style="height: 50%;">
          <i class="material-icons center" style="color: white;">
            keyboard_arrow_right
          </i>
        </a>`
        $('.mdl-layout__tab-bar').append(html)
        var item = $('.tab').last() // 
        item.unbind('click').click(function() {
          let tempArray = pathArray 
          initDirectory(tempArray.splice(
            0, i + 1
          ).join((path.includes("/")) ? "/" : "\\"))
        })
      }
    })
    $('.arrow').last().remove() //remove last arrow
    $('.tab').last().addClass('is-active') //show right-most tab as active
  }

  function initDirectory(path) {
    $('ul').children().remove() //clear old directory tabs
    var request = {
      action: "listFiles"
    }
    if (path) {
      request.path = path
      rootPath = path
    }
    $.post('/api', request, function(data) {
      path = data.path
      initPath(path)
      var files = [
        data.files.filter(function(file) {
          return file.isDirectory
        }),
        data.files.filter(function(file) {
          return file.isFile
        })
      ]
      files = files.map(function(group) {
        if (group.length > 1) {
          group.sort(function(a, b) {
            var textA = a.name.toLowerCase().split("").splice(0, a.name.indexOf('.')) //remove extension from name
            var textB = b.name.toLowerCase().split("").splice(0, b.name.indexOf('.')) //remove extension from name
            if (textA < textB)
              return -1
            else if (textA > textB)
              return 1
            else 
              return 0
          })
          return group
        }
        return group
      })
      files = files[0].concat(files[1])
      files.forEach(function(file, index) {
        var size = function() {
          var sizes = ["bytes", "kilobytes", "megabytes", "gigabytes", "terabytes"]
          for (var i in sizes) {
            if (file.size / 1024 >= 1) file.size /= 1024
            else return `${file.size.toFixed(3)} ${(file.size.toFixed(3) < 2) ? sizes[i].slice(0, -1) : sizes[i]}` //return formatted size
          }
        }()
        var created = function() {
          var options = {
            weekday: "long", year: "numeric", month: "short",  
            day: "numeric", hour: "2-digit", minute: "2-digit"  
          }
          return (new Date(file.created)).toLocaleTimeString("en-us", options) //return formatted creation date
        }()
        //html for new row
        var item = $(`
        <li class="mdl-list__item mdl-list__item--two-line mdl-menu__item--full-bleed-divider file" path=${file.path} name=${file.name} isFile="${file.isFile}">
          <span class="mdl-list__item-primary-content">
            <i class="material-icons mdl-list__item-avatar" style="background-color: white; color: black;"> ${(file.isFile == true) ? 'insert_drive_file' : 'folder'}</i>
            <span> ${file.name} ${(file.isFile == true) ? `- ${size}` : ""} </span>
            <span class="mdl-list__item-sub-title">${created}</span>
          </span>
          <a class="mdl-list__item-secondary-action">
            <label class="mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect selectionBox" id="checkboxContainer-${index}" for="checkbox-${index}" style="display: none;">
              <input type="checkbox" id="checkbox-${index}" class="mdl-checkbox__input">
            </label>
          ${(isMobile) ? 
            `<button class="mdl-button mdl-js-button mdl-button--icon moreButton" id="more-${index}">
              <i class="material-icons moreButton" style="color: black;">more_vert</i>
            </button>` : ""
          }
          </a>
        </li>`)
        
        $('#main').append(item) //add row to DOM
        //assign actions
        item.unbind('hover').hover(function() {
          $(this).addClass('isHovering') //add hover class 
        }, function() {
          $(this).removeClass('isHovering') //remove hover class
        })
        item.unbind('mousedown').mousedown(function() { //mouse click down action
          $('.file').removeClass('isSelected') //disable selection for all
          $(this).addClass('isSelected') //add selection to selected row
        })
        item.unbind('click').click(function() { //single click action
          $(this).toggleClass('isSelected') //toggle selection for row in question
        })
        
        item.unbind('dblclick').dblclick(function() { //double click action
          //load file/folder
          if (file.isFile) {
            $.post('/api', {
              action: "editFile",
              path: path,
              name: file.name,
              isMobile: isMobile,
              filePath: path,
              isFile: file.isFile
            }, function() {
              var newWindow = window.open("/edit") //open new tab
            })
          }
          else {
            initDirectory(file.path)
          }
        })
        if (isMobile) {// able to use moblie version 
          item.doubletap(function() {
            item.dblclick()
          })
        }
        
        item.unbind('contenxtmenu').contextmenu(function(e) {
          contextMenu((file.isFile == true) ? "file" : "folder", e, path, item, file) //assign context menu for file/folder row
        })
        item.find('button').unbind('click').click(function(e) {
          mouse.x = e.pageX; mouse.y = e.pageY //helps determine what context menu to show
          contextMenu((file.isFile == true) ? "file" : "folder", e, path, item, file) //assign context menu for file/folder row menu button
        })
        componentHandler.upgradeElement($(`#checkboxContainer-${index}`)[0]) //materialize
        $(`#checkboxContainer-${index}`).hide() //hide current selection box
      })
      
    })
  }

  initDirectory(rootPath) //init initial path
  
  //right click menu

  function contextMenu(menuType, e, path, selector, file) {
    
    var fileMenu = $('#file-context-menu')
    var pageMenu = $('#create-context-menu')
    var selectionMenu = $('#selection-context-menu')
		var folderMenu = $('#folder-context-menu')
    
    var menu = (menuType == "file") ? fileMenu : (menuType == "folder") ? folderMenu : (menuType == "selection") ? selectionMenu : pageMenu
    var otherMenu = (fileMenu == menu) ? pageMenu : fileMenu

    if (menuType == "file" || menuType == "folder") {
      // hideContextMenu()
      otherMenu.slideUp('fast')
      if (fileMenu == menu) folderMenu.slideUp('fast')
      mouse.x = e.pageX
      mouse.y = e.pageY
      assignActions(menu, path, selector, file)
      //determine where to put context menu based on invocation location
      if (e.pageX + 160 > $(window).width())
        menu.css("left", e.pageX - 160)
      else menu.css("left", e.pageX)
      
      if (e.pageY + 190 > $(window).height())
        menu.css("top", e.pageY - 190)
      else menu.css("top", e.pageY)
      
      if (menu.is(':visible') === false) {
        menu.slideDown('fast')
      }
    }
    else if (menuType == "selection") {
      hideContextMenu()

      otherMenu.slideUp('fast')
      assignActions(menu)
      //determine where to put context menu based on invocation location
      if (e.pageX + 160 > $(window).width()) 
        menu.css("left", e.pageX - 160)
      else menu.css("left", e.pageX)
    
      if (e.pageY + 95 > $(window).height()) 
        menu.css("top", e.pageY - 95)
      else menu.css("top", e.pageY)
      
      if (menu.is(':visible') === false) 
        menu.slideDown('fast')
    }
    else {
      if (mouse.x == e.pageX && mouse.y == e.pageY)
        menu.hide()
      else {
        otherMenu.slideUp('fast')
        assignActions(menu, path)
        //determine where to put context menu based on invocation location
        if (e.pageX + 160 > $(window).width()) 
          menu.css("left", e.pageX - 160)
        else menu.css("left", e.pageX)
          
        if (e.pageY + 95 > $(window).height())
          menu.css("top", e.pageY - 95)
        else menu.css("top", e.pageY)
        
        if (menu.is(':visible') === false) {
          menu.slideDown('fast')
        }
      }
    }    
  }
  
  $(document).click()

  function assignActions(menu, path, selector, file) {
    menu.find('#open').unbind('click').click(function() {
      $(selector).dblclick()
    })
    menu.find('#edit').unbind('click').click(function() {
      print('edit', file.name)
      $.post('/api', {
        action: "editFile",
        path: path,
        name: file.name,
        isMobile: isMobile,
        filePath: path,
        isFile: file.isFile
      }, function() {
        var newWindow = window.open("/edit") //open new tab
      })
    })
    menu.find('#download').unbind('click').click(function() {
      print('download', file.name)
			var p = (file.path.split("").includes('/')) ? file.path.split('/').join("|") : file.path.split('\\').join("|")
      var data = {
        action: "downloadFile",
        name: file.name,
        data: [{
          name: file.name,
          path: (file.isFile === true) ? p : `${p}|`
        }]
      }
      // Use XMLHttpRequest instead of Jquery $ajax
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        var a;
        if (xhttp.readyState === 4 && xhttp.status === 200) {
          // Trick for making downloadable link
          a = document.createElement('a')
          a.href = window.URL.createObjectURL(xhttp.response)
          // Give filename you wish to download
          print(xhttp.response)
          a.download = "archive.zip"
          a.style.display = 'none'
          document.body.appendChild(a)
          a.click();
        }
      };
      // Post data to URL which handles post request
      xhttp.open("POST", '/api');
      xhttp.setRequestHeader("Content-Type", "application/json");
      // You should set responseType as blob for binary responses
      xhttp.responseType = 'blob';
      xhttp.send(JSON.stringify(data));
      
    })
    menu.find('#rename').unbind('click').click(function() {// rename action 
      var dialog = document.getElementById('renameDialog')
      dialog.showModal()
      var item = $('#renameDialog')
      
      item.find('#renameField').val(file.name)
      item.find('#renameSubmit').unbind('click').click(function() {
        var input = item.find('#renameField').val()
        var newPath = `${path}${(path.includes("/") ? "/" : "\\")}${input}`
        $.post('/api', {
          action: "rename", 
          path: file.path, 
          name: newPath
        }, function(error) {
          if (error) {
            print(error)
          }
          else {
            initDirectory(path)
            dialog.close()
          }
        })
      })
      item.find('#renameCancel').unbind('click').click(function() {
        dialog.close()
      })
    })
    menu.find('#delete').unbind('click').click(function() {
      var dialog = document.getElementById('deleteDialog')
      dialog.showModal()
      var item = $('#deleteDialog')
      item.find('#deleteTitle').text(file.name)
      item.find('#deleteSubmit').unbind('click').click(function() {
        $.post('/api', {
          action: (file.isFile) ? "deleteFile" : "deleteDirectory", 
          path: file.path 
        }, function(error) {
          if (error) {
            print(error)
          }
          else {
            initDirectory(path)
            dialog.close()
          }
        })
      })
      item.find('#deleteCancel').unbind('click').click(function() {
        dialog.close()
      })
    })
    menu.find('#newFolder').unbind('click').click(function() {
      var item = $('#newFolderDialog')
      item[0].showModal()
      item.find('#newFolderField').val('folder')
      item.find('#newFolderSubmit').unbind('click').click(function() {
        var input = item.find('#newFolderField').val()
        if (input != "") {
          $.post('/api', {
            action: "newFolder", 
            path: path,
            name: input
          }, function(error) {
            if (error) {
              print(error)
            }
            else {
              initDirectory(path)
              dialog.close()
            }
          })
        }
      })
      item.find('#newFolderCancel').unbind('click').click(function() {
        item[0].close()
      })
    })
    menu.find('#upload').unbind('click').click(function() {
      $('#file')[0].click()
    })
    menu.find('#downloadSelected').unbind('click').click(function() {
      print('download Selected')
      var list = []
      $('.is-checked').each(function(index, element) {
        var p = $(element).closest('li').attr('path')
        list.push({
          name: $(element).closest('li').attr('name'),
          path: ($(element).closest('li').attr('isFile') === 'true') ? p : p + "/"
        })
      })
      var data = {
        action: "downloadFile",
        data: list
      }
      // Use XMLHttpRequest instead of Jquery $ajax
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        var a;
        if (xhttp.readyState === 4 && xhttp.status === 200) {
          // Trick for making downloadable link
          a = document.createElement('a')
          a.href = window.URL.createObjectURL(xhttp.response)
          // Give filename you wish to download
          a.download = "archive.zip"
          a.style.display = 'none'
          document.body.appendChild(a)
          a.click();
        }
      }
      // Post data to URL which handles post request
      xhttp.open("POST", '/api')
      xhttp.setRequestHeader("Content-Type", "application/json")
      // You should set responseType as blob for binary responses
      xhttp.responseType = 'blob'
      xhttp.send(JSON.stringify(data))
    })
    menu.find('#deleteSelected').unbind('click').click(function() {
      var list = []
      $('.is-checked').each(function(index, element) {
        list.push($(element).closest('li').attr('path'))
      })

      var dialog = document.getElementById('deleteDialog')
      dialog.showModal()
      var item = $('#deleteDialog')
      item.find('#deleteTitle').text(`Delete ${list.length} files`)
      item.find('#deleteSubmit').unbind('click').click(function() {
        $.post('/api', {
          action: "deleteDirectory",
          paths: list
        }, function(result) {
          print(result)
        })
      })
      item.find('#deleteCancel').unbind('click').click(function() {
        dialog.close()
      })
    })
  }
})})