//localStorage.clear();

const VIEW_MODE_DAYS = 0;
const VIEW_MODE_MONTHS = 1;
const VIEW_MODE_YEARS = 2;

let notes = {};
let currDate = new Date();
let currViewMode = VIEW_MODE_DAYS;

let selectedDay;
let calendarRefreshTimeout;

// limit event characters length
$('#event_textarea').on('change keyup keydown paste', function(){
    var currVal = $(this).val();
    if(currVal.length > 128)
    {
        $(this).val(currVal.substr(0, 128));
    }
    
    $('#characters_left_text').text((128 - $(this).val().length) + ' characters left');
});

// adding notes
$('.add_event_ok_btn').click(function(){

    let noteValue = $('#event_textarea').val();
    
    if(noteValue.length == 0)
    {
        $('#content_error').css('opacity', '1');
        return;
    }
    
    // save to local storage
    notes[selectedDay.parent().attr('id')] = noteValue;
    saveNotes();

    // adding note
    addNote(selectedDay, noteValue);
});

$('.close_btn').click(function(){
    $('#bg').css('visibility', 'hidden').css('opacity', '0');
});

// changing view

$('.prev').click(function(){
    changeDate(false);
});

$('.next').click(function(){
    changeDate(true);
});

$('.years').click(function(){
    currViewMode = VIEW_MODE_YEARS;
    updateCalendar();
});

$('.months').click(function(){
    currViewMode = VIEW_MODE_MONTHS;
    updateCalendar();
});

$('.days').click(function(){
    currViewMode = VIEW_MODE_DAYS;
    updateCalendar();
});

function changeDate(next) {
    let mod = (next ? 1 : -1)

    switch(currViewMode)
    {
        case VIEW_MODE_DAYS:
            currDate.setMonth(currDate.getMonth() + mod);
            break;

        case VIEW_MODE_MONTHS:
            currDate.setMonth(currDate.getMonth() + mod * 12);
            break;

        case VIEW_MODE_YEARS:
            currDate.setFullYear(currDate.getFullYear() + mod * 42);
            break;
    }
    updateCalendar();
}

function addNote(day, noteContent){
    day.find('.add_event_btn').remove();
    let note = $(document.createElement('div'));
    note.addClass('note');
    note.text(noteContent);
    note.append('<br><br>');
    
    let noteRemoveBtn = $(document.createElement('button'));
    noteRemoveBtn.addClass('note_remove_btn');
    noteRemoveBtn.text('Remove');
    note.append(noteRemoveBtn);
    
    day.append(note);
    $('#bg').css('visibility', 'hidden').css('opacity', '0');

    // fancy animation
    day.parent().css('transform', 'rotate(360deg)');
    day.parent().css('transition', '0.4s');

    noteRemoveBtn.click(function(){
        var parent = $(this).parent().parent();
        
        let btn = $(document.createElement('button'));
        btn.addClass('add_event_btn');
        btn.text("Add Event");
        parent.append(btn);

        btn.click(function(){
            selectedDay = $(this).parent();
            $('#content_error').css('opacity', '0');
            $('#bg').css('visibility', 'visible').css('opacity', '1');
            $('#event_textarea').val('');
            $('#characters_left_text').text('128 characters left');
        });
        
        // let day = $(this).parent().parent().parent();
        let dayParent = $(this).closest("td");

        // reset fancy animation
        dayParent.css('transform', '');
        dayParent.css('transition', '');
        
        delete notes[dayParent.attr("id")];
        saveNotes();

        $(this).parent().remove();
    });
}

function saveNotes(){
    localStorage.setItem('notes', JSON.stringify(notes));
}

function saveView(){
    localStorage.setItem('view', JSON.stringify(currViewMode));    
    localStorage.setItem('date', JSON.stringify(currDate));    
}

function updateCalendar(){
    saveView();
    const table = $('table');
    
    table.empty();
    
    //make header if we have days
    if(currViewMode == VIEW_MODE_DAYS) {
        $('#view_header').text(currDate.toLocaleString('en-EN', { month: 'long' }) + ', ' + currDate.getFullYear());
        table.append(' \
        <tr style="background-color: blanchedalmond;"> \
        <th><span>Mo</span></td> \
        <th><span>Tu</span></td> \
        <th><span>We</span></td> \
        <th><span>Th</span></td> \
        <th><span>Fr</span></td> \
        <th><span>Sa</span></td> \
        <th><span>Su</span></td> \
        </tr> \
        ');
        
        let firstDay = new Date(currDate.getFullYear(), currDate.getMonth(), 1).getDay() - 1;
        const daysCount = new Date(currDate.getFullYear(), currDate.getMonth()+1, 0).getDate();
        
        // sunday
        if(firstDay == -1)
            firstDay = 6;

        for(let i = 0; i < 6; i++) {
            table.append('<tr>');
            for(let j = 0; j < 7; j++) {
                let dayIndex = j + i * 7;
                let td = $(document.createElement('td'));
                table.append(td);
                td.addClass('cell');

                let id = (dayIndex - firstDay)+1 + "." + currDate.getMonth() + "." + currDate.getFullYear();
                td.attr('id', id);
                
                let span = $(document.createElement('span'));               
                td.append(span);
                
                // days not present in this month
                if(dayIndex < firstDay || (dayIndex - firstDay) >= daysCount)
                {
                    td.addClass('not_included');
                }
                else
                {
                    if(j == 6)
                    {
                        if(dayIndex % 2 == 0)
                            td.addClass('sunday_even');
                        else
                            td.addClass('sunday');
                    }
                    else if(dayIndex % 2 == 0)                
                        td.addClass('cell_even');

                    span.text((dayIndex - firstDay) + 1);
                    span.append('<br>');
                    
                    let btn = $(document.createElement('button'));
                    btn.addClass('add_event_btn');
                    btn.text("Add Event");
                    span.append(btn);
                }
                
                if(notes[id])
                    addNote(span, notes[id]);
            }
            table.append('</tr>');
        }

        $('.cell').mouseenter(function(){
            $(this).find('button.add_event_btn').css('opacity', '1');
        }).mouseleave(function(){
            $(this).find('button.add_event_btn').css('opacity', '0');
        });

        $('.add_event_btn').click(function(){
            selectedDay = $(this).parent();
            $('#content_error').css('opacity', '0');
            $('#bg').css('visibility', 'visible').css('opacity', '1');
            $('#event_textarea').val('');
            $('#characters_left_text').text('128 characters left');
        });
    }
    else if(currViewMode == VIEW_MODE_MONTHS){
        $('#view_header').text(currDate.getFullYear());
        let index = 1;
        for(let i = 0; i < 2; i++) {
            table.append('<tr>');
            for(let j = 0; j < 7; j++) {
                
                let td = $(document.createElement('td'));
                table.append(td);
                td.addClass('cell');
                               
                let span = $(document.createElement('span'));               
                td.append(span);
                
                if((i == 0 && j == 6) || (i == 1 && j == 0))
                {
                    td.addClass('not_included');
                }
                else
                {
                    if((j + i * 7) % 2 == 0)
                    {                        
                        td.addClass('cell_even');
                    }

                    td.addClass('month');
                    td.attr('id', index);
                    var date = new Date(currDate.getFullYear(), index, 0);
                    span.text(date.toLocaleString('en-EN', { month: 'long' }));
                    index++;
                }
            }
            table.append('</tr>');
        }

        $('.month').click(function(){
            currViewMode = VIEW_MODE_DAYS;
            currDate = new Date(currDate.getFullYear(), parseInt($(this).attr('id')), 0);

            updateCalendar();
        });
    }
    else if(currViewMode == VIEW_MODE_YEARS){
        $('#view_header').text((currDate.getFullYear() - 17) + ' - ' + (currDate.getFullYear() + 24));
        let year = -16;
        for(let i = 0; i < 6; i++) {
            table.append('<tr>');
            for(let j = 0; j < 7; j++) {
                var date = new Date(currDate.getFullYear() + year, 0, 0);
                
                let td = $(document.createElement('td'));
                table.append(td);
                td.addClass('cell');

                if(year % 2 == 0)
                    td.addClass('cell_even');
                               
                let span = $(document.createElement('span'));               
                td.append(span);
                
                td.attr('id', date.getFullYear()+1);
                span.text(date.getFullYear());

                year++;
            }
            table.append('</tr>');
        }

        $('.cell').click(function(){
            currViewMode = VIEW_MODE_MONTHS;
            currDate = new Date(parseInt($(this).attr('id')), 0, 0);

            updateCalendar();
        });
    }
}

if(localStorage.getItem('notes'))
    notes = JSON.parse(localStorage.getItem('notes'));

if(localStorage.getItem('view'))
{
    currViewMode = JSON.parse(localStorage.getItem('view'));   
    currDate = new Date(JSON.parse(localStorage.getItem('date')));   
}

updateCalendar();