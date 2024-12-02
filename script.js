// Select DOM elements
const todoInput = document.getElementById('todo-input');
const todoDateTimeInput = document.getElementById('todo-datetime');
const addTaskBtn = document.getElementById('add-task-btn');
const todoList = document.getElementById('todo-list');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const themeToggleCheckbox = document.getElementById('theme-toggle-checkbox');

// Select popup elements
const popup = document.getElementById('popup');
const popupMessage = document.getElementById('popup-message');
const popupCloseBtn = document.getElementById('popup-close-btn');

// Load tasks and theme from local storage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let isDarkMode = JSON.parse(localStorage.getItem('isDarkMode')) || false;

document.body.classList.toggle('dark', isDarkMode);
themeToggleCheckbox.checked = isDarkMode; // Set the checkbox state

// Toggle theme function
function toggleTheme() {
  isDarkMode = themeToggleCheckbox.checked; // Get the checkbox state
  localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
  document.body.classList.toggle('dark', isDarkMode);
}

// Helper function to format date and time in a simpler manner
function formatDateTime(dateTime) {
  const date = new Date(dateTime);
  
  // Format Date: MM/DD/YYYY
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;

  // Format Time: HH:MM AM/PM
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // Adjust 0 to 12 for 12 AM/PM
  const formattedTime = `${hours}:${minutes} ${period}`;

  return `${formattedDate} at ${formattedTime}`;
}

// Add task to the list
function addTask() {
  const taskText = todoInput.value.trim();
  const taskDateTime = todoDateTimeInput.value;

  if (taskText !== '' && taskDateTime !== '') {
    const task = {
      text: taskText,
      dateTime: taskDateTime,
      completed: false,
      notified: false,  // Added a flag for notifications
    };

    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
    todoInput.value = '';
    todoDateTimeInput.value = '';
  } else {
    alert("Please enter both task description and date/time.");
  }
}

// Render tasks to the list
function renderTasks() {
  todoList.innerHTML = ''; // Clear existing tasks
  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.classList.add('todo-item');
    if (task.completed) li.classList.add('completed'); // Apply completed styles

    li.innerHTML = `
      <div class="task-meta">
        <small>${formatDateTime(task.dateTime)}</small>
      </div>
      <span class="todo-text">${task.text}</span>
      <button onclick="deleteTask(${index})">
        <i class="fas fa-times"></i>
      </button>
    `;

    // Add click listener to toggle task completion
    li.addEventListener('click', (e) => {
      // Prevent triggering toggle when clicking the delete button
      if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'I') {
        toggleTaskCompletion(index);
      }
    });

    // todoList.appendChild(li);
    todoList.insertBefore(li, todoList.firstChild);

    // Check for reminders for each task
    checkTaskReminder(task, index);
  });
}

// Toggle task completion
function toggleTaskCompletion(index) {
  tasks[index].completed = !tasks[index].completed; // Toggle the `completed` status
  localStorage.setItem('tasks', JSON.stringify(tasks)); // Update the localStorage
  renderTasks(); // Re-render the task list to reflect changes
}

// Delete task
function deleteTask(index) {
  tasks.splice(index, 1); // Remove the task from the array
  localStorage.setItem('tasks', JSON.stringify(tasks)); // Update the localStorage
  renderTasks(); // Re-render the task list
}

// Check if task datetime is due and show reminder
function checkTaskReminder(task, index) {
  const taskDateTime = new Date(task.dateTime);
  const currentTime = new Date();

  // Check if the task time is less than the current time and hasn't been notified yet
  if (taskDateTime <= currentTime && !task.notified) {
    showPopup(`Reminder: Task "${task.text}" is due!`);
    tasks[index].notified = true; // Mark the task as notified
    localStorage.setItem('tasks', JSON.stringify(tasks)); // Update the localStorage
  }
}

// Show the popup with a custom message
function showPopup(message) {
  popupMessage.textContent = message;
  popup.style.display = 'flex'; // Show popup
}

// Hide the popup when close button is clicked
popupCloseBtn.addEventListener('click', () => {
  popup.style.display = 'none'; // Hide popup
});

// Optional: Close the popup when clicking outside of it
popup.addEventListener('click', (e) => {
  if (e.target === popup) {
    popup.style.display = 'none';
  }
});

// Event listeners
addTaskBtn.addEventListener('click', addTask);
// themeToggleBtn.addEventListener('click', toggleTheme);
themeToggleCheckbox.addEventListener('change', toggleTheme);


// Initial render
renderTasks();

// Check reminders every minute (60000 ms)
setInterval(() => {
  tasks.forEach((task, index) => {
    checkTaskReminder(task, index);
  });
  localStorage.setItem('tasks', JSON.stringify(tasks)); // Save any updates to localStorage
}, 60000); // Check every minute
