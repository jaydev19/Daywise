document.addEventListener('DOMContentLoaded', function () {
  const taskInput = document.getElementById('task-input');
  const addTaskButton = document.getElementById('add-task');
  const todoList = document.getElementById('todo-list');

  const currentMonthEl = document.getElementById('current-month');
  const currentDayEl = document.getElementById('current-day');
  const currentWeekdayEl = document.getElementById('current-weekday');

  const prevMonthButton = document.getElementById('prev-month');
  const nextMonthButton = document.getElementById('next-month');
  const prevDayButton = document.getElementById('prev-day');
  const nextDayButton = document.getElementById('next-day');

  const userNameEl = document.getElementById('user-name');
  const calendarGrid = document.getElementById('calendar-grid');

  let currentDate = new Date();

  function formatDate(date) {
    return date.getDate().toString().padStart(2, '0') + '.' +
           (date.getMonth() + 1).toString().padStart(2, '0');
  }

  function updateDateUI() {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    currentMonthEl.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    currentDayEl.textContent = formatDate(currentDate);
    currentWeekdayEl.textContent = dayNames[currentDate.getDay()];

    loadTasksForCurrentDay();
  }

  function generateCalendarGrid() {
    calendarGrid.innerHTML = '';
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const firstDayIndex = firstDayOfMonth.getDay();
    const lastDayIndex = lastDayOfMonth.getDate();

    for (let i = 0; i < firstDayIndex; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.classList.add('calendar-cell', 'empty');
      calendarGrid.appendChild(emptyCell);
    }

    for (let i = 1; i <= lastDayIndex; i++) {
      const dayCell = document.createElement('div');
      dayCell.classList.add('calendar-cell');
      dayCell.textContent = i;
      dayCell.addEventListener('click', function () {
        currentDate.setDate(i);
        updateDateUI();
        calendarGrid.style.display = 'none';
      });
      calendarGrid.appendChild(dayCell);
    }
  }

  function addTask() {
    if (taskInput.value.trim() !== '') {
      const task = { title: taskInput.value, status: 'todo' };
      addTaskToDOM(task);
      taskInput.value = '';
      saveTasks();
    }
  }

  function addTaskToDOM(task) {
    const li = document.createElement('li');
    li.draggable = true;
    li.classList.add('task-item');
  
    const taskText = document.createElement('span');
    taskText.textContent = task.title;
    taskText.classList.add('task-text');
  
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');
  
    const completeButton = document.createElement('button');
    completeButton.innerHTML = task.status === 'completed' ? '✔️' : '⬜'; // Check or Uncheck icon
    completeButton.classList.add('complete-btn');
    completeButton.setAttribute('aria-label', task.status === 'completed' ? 'Mark as To-Do' : 'Mark as Complete');
    
    completeButton.onclick = () => {
      if (task.status === 'completed') {
        task.status = 'todo';
        li.classList.remove('completed-task');
        taskText.classList.remove('completed-text');
        completeButton.innerHTML = '⬜'; // Uncheck icon
      } else {
        task.status = 'completed';
        li.classList.add('completed-task');
        taskText.classList.add('completed-text');
        completeButton.innerHTML = '✔️'; // Checkmark icon
      }
      saveTasks();
    };
  
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '❌'; // Cross icon
    deleteButton.classList.add('delete-btn');
    deleteButton.setAttribute('aria-label', 'Delete Task');
    
    deleteButton.onclick = () => {
      li.classList.add('fade-out');
      li.addEventListener('animationend', () => {
        li.remove();
        saveTasks();
      });
    };
  
    if (task.status === 'completed') {
      li.classList.add('completed-task');
      taskText.classList.add('completed-text');
    }
  
    buttonContainer.appendChild(completeButton);
    buttonContainer.appendChild(deleteButton);
    li.appendChild(taskText);
    li.appendChild(buttonContainer);
    todoList.appendChild(li);
  
    li.addEventListener('dragstart', handleDragStart);
    li.addEventListener('dragover', handleDragOver);
    li.addEventListener('drop', handleDrop);
  }

  function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.index);
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDrop(e) {
    e.preventDefault();
    const draggedIndex = e.dataTransfer.getData('text/plain');
    const targetIndex = e.target.dataset.index;

    if (draggedIndex !== targetIndex) {
      const draggedElement = todoList.children[draggedIndex];
      const targetElement = todoList.children[targetIndex];

      todoList.insertBefore(draggedElement, targetElement);
      saveTasks();
    }
  }

  function saveTasks() {
    chrome.storage.sync.get(['tasks'], function (result) {
      const allTasks = result.tasks || {};
      const currentTasks = Array.from(todoList.children).map(item => ({
        title: item.querySelector('.task-text').textContent,
        status: item.classList.contains('completed-task') ? 'completed' : 'todo'
      }));
  
      allTasks[formatDate(currentDate)] = currentTasks;
  
      chrome.storage.sync.set({ tasks: allTasks });
    });
  }
  
  function loadTasksForCurrentDay() {
    todoList.innerHTML = '';
    chrome.storage.sync.get(['tasks'], function (result) {
      const allTasks = result.tasks || {};
      const tasksForDay = allTasks[formatDate(currentDate)] || [];
  
      tasksForDay.forEach(task => addTaskToDOM(task));
    });
  }

  function setUserName(name) {
    userNameEl.textContent = name;
  }

  setUserName(' ');

  addTaskButton.addEventListener('click', addTask);

  taskInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      addTask();
    }
  });

  prevMonthButton.addEventListener('click', function () {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateDateUI();
    generateCalendarGrid();
  });

  nextMonthButton.addEventListener('click', function () {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateDateUI();
    generateCalendarGrid();
  });

  prevDayButton.addEventListener('click', function () {
    currentDate.setDate(currentDate.getDate() - 1);
    updateDateUI();
  });

  nextDayButton.addEventListener('click', function () {
    currentDate.setDate(currentDate.getDate() + 1);
    updateDateUI();
  });

  currentDayEl.addEventListener('click', function () {
    if (calendarGrid.style.display === 'none' || calendarGrid.style.display === '') {
      calendarGrid.style.display = 'grid';
      generateCalendarGrid();
    } else {
      calendarGrid.style.display = 'none';
    }
  });

  updateDateUI();
});
