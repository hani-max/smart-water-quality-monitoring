/**
 * Smart Water Quality Monitoring System
 * Professional JavaScript Implementation
 * Jimma University Institute of Technology - CBTP Project
 * Version: 1.0.0
 */

class WaterMonitoringSystem {
  constructor() {
    this.sensorData = {};
    this.updateInterval = null;
    this.isAutoRefresh = true;
    this.init();
  }

  // Initialize the application
  init() {
    console.log("🚀 Water Monitoring System Initialized");

    // Initialize all modules
    this.initEventListeners();
    this.initMobileMenu();
    this.initRealTimeUpdates();
    this.initDataTable();
    this.initSystemStatus();
    this.initNotifications();

    // Set initial values
    this.updateCurrentTime();
    this.setupAutoTimeUpdate();

    // Add CSS for dynamic elements
    this.injectDynamicStyles();
  }

  // ==================== MOBILE MENU ====================
  initMobileMenu() {
    const mobileMenuBtn = document.querySelector(".mobile-menu");
    const navMenu = document.querySelector(".nav-menu");

    if (mobileMenuBtn && navMenu) {
      // Toggle menu on button click
      mobileMenuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        navMenu.classList.toggle("active");
        mobileMenuBtn.classList.toggle("active");
      });

      // Close menu when clicking outside
      document.addEventListener("click", (e) => {
        if (!navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
          navMenu.classList.remove("active");
          mobileMenuBtn.classList.remove("active");
        }
      });

      // Close menu when clicking a link
      navMenu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          navMenu.classList.remove("active");
          mobileMenuBtn.classList.remove("active");
        });
      });
    }
  }

  // ==================== REAL-TIME UPDATES ====================
  initRealTimeUpdates() {
    // Initial sensor data
    this.sensorData = {
      ph: { value: 7.2, min: 6.5, max: 8.5, unit: "", precision: 1 },
      temperature: { value: 24.3, min: 20, max: 30, unit: "°C", precision: 1 },
      turbidity: { value: 4.2, min: 0, max: 10, unit: " NTU", precision: 1 },
      tds: { value: 180, min: 0, max: 500, unit: " ppm", precision: 0 },
      dissolvedOxygen: {
        value: 6.8,
        min: 0,
        max: 10,
        unit: " mg/L",
        precision: 1,
      },
      conductivity: {
        value: 250,
        min: 0,
        max: 1000,
        unit: " µS/cm",
        precision: 0,
      },
    };

    // Update all sensors immediately
    this.updateAllSensors();

    // Set up auto-refresh if enabled
    if (this.isAutoRefresh) {
      this.startAutoRefresh();
    }
  }

  updateAllSensors() {
    Object.keys(this.sensorData).forEach((sensor) => {
      this.updateSensorValue(sensor);
    });

    // Update timestamp
    this.updateLastUpdatedTime();

    // Show notification for any warnings
    this.checkForAlerts();
  }

  updateSensorValue(sensorName) {
    const sensor = this.sensorData[sensorName];
    if (!sensor) return;

    // Simulate realistic sensor variation
    const variation = (Math.random() - 0.5) * 0.3;
    let newValue = sensor.value + variation;

    // Keep within reasonable bounds
    newValue = Math.max(sensor.min * 0.9, Math.min(sensor.max * 1.1, newValue));

    // Update stored value
    sensor.value = newValue;

    // Update DOM
    const elementId = `${sensorName
      .replace(/([A-Z])/g, "-$1")
      .toLowerCase()}-value`;
    const element = document.getElementById(elementId);

    if (element) {
      if (sensor.precision === 0) {
        element.textContent = Math.round(newValue) + sensor.unit;
      } else {
        element.textContent = newValue.toFixed(sensor.precision) + sensor.unit;
      }

      // Update status indicator
      this.updateSensorStatus(sensorName, newValue, sensor.min, sensor.max);

      // Update reading time
      this.updateSensorTime(sensorName);
    }
  }

  updateSensorStatus(sensorName, value, min, max) {
    const elementId = `${sensorName
      .replace(/([A-Z])/g, "-$1")
      .toLowerCase()}-value`;
    const sensorElement = document.getElementById(elementId);
    if (!sensorElement) return;

    const card = sensorElement.closest(".sensor-card, .status-card");
    if (!card) return;

    const percentage = (value - min) / (max - min);
    let status = "normal";
    let statusText = "Normal";

    if (value < min) {
      status = "danger";
      statusText = "Low";
    } else if (value > max) {
      status = "danger";
      statusText = "High";
    } else if (percentage < 0.2 || percentage > 0.8) {
      status = "warning";
      statusText = "Warning";
    } else if (percentage < 0.3 || percentage > 0.7) {
      status = "warning";
      statusText = "Alert";
    }

    // Update status indicator
    const statusIndicator = card.querySelector(".status-indicator");
    if (statusIndicator) {
      statusIndicator.className = "status-indicator " + status;
    }

    // Update status label
    const statusLabel = card.querySelector(".status-label, .detail-value");
    if (statusLabel) {
      statusLabel.textContent = statusText;
      statusLabel.className =
        statusLabel.className.replace(/\b(good|warning|danger|normal)\b/g, "") +
        " " +
        status;
    }
  }

  updateSensorTime(sensorName) {
    const elementId = `${sensorName
      .replace(/([A-Z])/g, "-$1")
      .toLowerCase()}-value`;
    const sensorElement = document.getElementById(elementId);
    if (!sensorElement) return;

    const card = sensorElement.closest(".sensor-card");
    if (!card) return;

    const timeElement = card.querySelector(
      '.update-time span, .detail-value[id$="time"]'
    );
    if (timeElement) {
      const seconds = Math.floor(Math.random() * 30);
      timeElement.textContent = `${seconds} seconds ago`;
    }
  }

  // ==================== AUTO-REFRESH SYSTEM ====================
  startAutoRefresh() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      this.updateAllSensors();
    }, 5000); // Update every 5 seconds

    this.showNotification("Auto-refresh enabled", "success");
  }

  stopAutoRefresh() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      this.showNotification("Auto-refresh disabled", "warning");
    }
  }

  toggleAutoRefresh() {
    this.isAutoRefresh = !this.isAutoRefresh;

    if (this.isAutoRefresh) {
      this.startAutoRefresh();
    } else {
      this.stopAutoRefresh();
    }

    // Update UI
    const statusElement = document.getElementById("auto-refresh-status");
    if (statusElement) {
      statusElement.textContent = this.isAutoRefresh ? "Enabled" : "Disabled";
      statusElement.className = this.isAutoRefresh ? "good" : "warning";
    }
  }

  // ==================== DATA TABLE MANAGEMENT ====================
  initDataTable() {
    const tableBody = document.getElementById("dataTableBody");
    if (!tableBody) return;

    this.generateTableData();
    this.setupTableSearch();
    this.setupTablePagination();
  }

  generateTableData(count = 10) {
    const tableBody = document.getElementById("dataTableBody");
    if (!tableBody) return;

    const rows = [];
    const now = new Date();

    for (let i = 0; i < count; i++) {
      const time = new Date(now - i * 3600000);
      const rowData = this.generateRandomReading(time);
      rows.push(this.createTableRow(rowData));
    }

    tableBody.innerHTML = rows.join("");
  }

  generateRandomReading(timestamp) {
    return {
      timestamp: timestamp.toLocaleString(),
      ph: (6.5 + Math.random() * 2).toFixed(1),
      temperature: (20 + Math.random() * 10).toFixed(1),
      turbidity: (Math.random() * 6).toFixed(1),
      tds: Math.round(100 + Math.random() * 400),
      dissolvedOxygen: (4 + Math.random() * 4).toFixed(1),
      conductivity: Math.round(100 + Math.random() * 900),
      status:
        Math.random() > 0.9
          ? "danger"
          : Math.random() > 0.7
          ? "warning"
          : "good",
    };
  }

  createTableRow(data) {
    const statusText = {
      good: "Normal",
      warning: "Warning",
      danger: "Alert",
    };

    return `
            <tr>
                <td>${data.timestamp}</td>
                <td>${data.ph}</td>
                <td>${data.temperature}°C</td>
                <td>${data.turbidity} NTU</td>
                <td>${data.tds} ppm</td>
                <td>${data.dissolvedOxygen} mg/L</td>
                <td>${data.conductivity} µS/cm</td>
                <td><span class="status-badge ${data.status}">${
      statusText[data.status]
    }</span></td>
            </tr>
        `;
  }

  setupTableSearch() {
    const searchInput = document.getElementById("searchInput");
    if (!searchInput) return;

    searchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const rows = document.querySelectorAll("#dataTableBody tr");

      rows.forEach((row) => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? "" : "none";
      });

      this.updateTableStats();
    });
  }

  setupTablePagination() {
    const prevBtn = document.querySelector(".page-btn:first-child");
    const nextBtn = document.querySelector(".page-btn:last-child");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => this.changePage(-1));
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => this.changePage(1));
    }
  }

  changePage(direction) {
    // Implement pagination logic here
    this.showNotification(
      `Loading page ${direction > 0 ? "next" : "previous"}...`,
      "info"
    );
  }

  updateTableStats() {
    const visibleRows = document.querySelectorAll(
      '#dataTableBody tr:not([style*="display: none"])'
    ).length;
    const totalRows = document.querySelectorAll("#dataTableBody tr").length;

    const statsElement = document.querySelector(".records-info");
    if (statsElement) {
      statsElement.textContent = `Showing ${visibleRows} of ${totalRows} records`;
    }
  }

  // ==================== NOTIFICATION SYSTEM ====================
  initNotifications() {
    // Check for existing alerts on page load
    setTimeout(() => {
      this.checkForAlerts();
    }, 2000);
  }

  checkForAlerts() {
    Object.keys(this.sensorData).forEach((sensor) => {
      const data = this.sensorData[sensor];
      const value = data.value;
      const min = data.min;
      const max = data.max;

      if (value < min * 1.05 || value > max * 0.95) {
        const sensorName = sensor.replace(/([A-Z])/g, " $1");
        const message = `${sensorName}: ${value.toFixed(data.precision)}${
          data.unit
        } (Safe range: ${min}-${max}${data.unit})`;

        if (value < min || value > max) {
          this.showNotification(`🚨 ALERT: ${message}`, "danger");
        } else if (value < min * 1.1 || value > max * 0.9) {
          this.showNotification(`⚠️ Warning: ${message}`, "warning");
        }
      }
    });
  }

  showNotification(message, type = "info") {
    // Remove existing notifications
    const existing = document.querySelector(".notification");
    if (existing) existing.remove();

    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;

    const icons = {
      success: "check-circle",
      warning: "exclamation-triangle",
      danger: "exclamation-circle",
      info: "info-circle",
    };

    notification.innerHTML = `
            <i class="fas fa-${icons[type] || "info-circle"}"></i>
            <span>${message}</span>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;

    // Add to document
    document.body.appendChild(notification);

    // Add close functionality
    notification
      .querySelector(".notification-close")
      .addEventListener("click", () => {
        notification.remove();
      });

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

  // ==================== SYSTEM STATUS MONITORING ====================
  initSystemStatus() {
    this.updateSystemStatus();
    setInterval(() => this.updateSystemStatus(), 10000); // Update every 10 seconds
  }

  updateSystemStatus() {
    const statusCards = document.querySelectorAll(".system-card");

    statusCards.forEach((card) => {
      // Simulate occasional status changes (5% chance)
      if (Math.random() > 0.95) {
        const isOnline = card.classList.contains("online");
        card.classList.toggle("online");
        card.classList.toggle("offline");

        const statusText = card.querySelector(".system-status-text");
        if (statusText) {
          statusText.textContent = isOnline ? "Offline" : "Online";
          statusText.className = `system-status-text ${
            isOnline ? "offline" : "online"
          }`;
        }

        const sensorName = card.querySelector("h4").textContent;
        this.showNotification(
          `System Status: ${sensorName} is now ${
            isOnline ? "Offline" : "Online"
          }`,
          "warning"
        );
      }
    });
  }

  // ==================== EVENT LISTENERS ====================
  initEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById("refreshBtn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => this.handleRefresh());
    }

    // Auto-refresh toggle
    const toggleRefreshBtn = document.getElementById("toggleRefresh");
    if (toggleRefreshBtn) {
      toggleRefreshBtn.addEventListener("click", () =>
        this.toggleAutoRefresh()
      );
    }

    // Export button
    const exportBtn = document.getElementById("exportBtn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => this.exportData());
    }

    // Time range buttons
    document.querySelectorAll(".time-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleTimeRange(e.target));
    });

    // Contact form
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
      contactForm.addEventListener("submit", (e) => this.handleContactForm(e));
    }

    // Window resize - handle responsive behavior
    window.addEventListener("resize", () => this.handleResize());
  }

  handleRefresh() {
    const btn = document.getElementById("refreshBtn");
    if (!btn) return;

    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
    btn.disabled = true;

    this.updateAllSensors();

    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.disabled = false;
      this.showNotification("Data refreshed successfully!", "success");
    }, 1000);
  }

  handleTimeRange(button) {
    // Remove active class from all buttons
    document.querySelectorAll(".time-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    // Add active class to clicked button
    button.classList.add("active");

    const range = button.dataset.range;
    this.showNotification(`Loading data for last ${range} days...`, "info");

    // Simulate data loading
    setTimeout(() => {
      this.generateTableData();
      this.showNotification(`Data loaded for last ${range} days`, "success");
    }, 1500);
  }

  async exportData() {
    const btn = document.getElementById("exportBtn");
    if (!btn) return;

    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
    btn.disabled = true;

    // Simulate export process
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Create CSV data
    const headers = [
      "Timestamp",
      "pH",
      "Temperature",
      "Turbidity",
      "TDS",
      "Dissolved Oxygen",
      "Conductivity",
      "Status",
    ];
    const rows = [];

    // Add current data
    const now = new Date();
    Object.keys(this.sensorData).forEach((sensor, index) => {
      const data = this.sensorData[sensor];
      const sensorName = sensor.replace(/([A-Z])/g, " $1");
      rows.push([
        now.toLocaleString(),
        sensorName,
        `${data.value.toFixed(data.precision)}${data.unit}`,
        this.getStatusText(data.value, data.min, data.max),
      ]);
    });

    // Create CSV content
    let csvContent = headers.join(",") + "\n";
    rows.forEach((row) => {
      csvContent += row.join(",") + "\n";
    });

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `water_quality_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    // Reset button
    btn.innerHTML = originalHTML;
    btn.disabled = false;

    this.showNotification("Data exported successfully as CSV!", "success");
  }

  getStatusText(value, min, max) {
    if (value < min) return "Danger - Low";
    if (value > max) return "Danger - High";
    if (value < min * 1.1 || value > max * 0.9) return "Warning";
    return "Normal";
  }

  async handleContactForm(event) {
    event.preventDefault();
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');

    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000));

    submitBtn.innerHTML = originalHTML;
    submitBtn.disabled = false;

    this.showNotification(
      "Message sent successfully! We will contact you soon.",
      "success"
    );
    form.reset();
  }

  handleResize() {
    // Handle responsive behavior
    const navMenu = document.querySelector(".nav-menu");
    const mobileMenuBtn = document.querySelector(".mobile-menu");

    if (window.innerWidth > 768) {
      navMenu.classList.remove("active");
      if (mobileMenuBtn) mobileMenuBtn.classList.remove("active");
    }
  }

  // ==================== UTILITY FUNCTIONS ====================
  updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const dateString = now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Update time elements
    document.querySelectorAll("#current-time, #update-time").forEach((el) => {
      if (el.id === "current-time" || el.id === "update-time") {
        el.textContent = timeString;
      }
    });

    // Update date element
    const dateElement = document.getElementById("currentDate");
    if (dateElement) {
      dateElement.textContent = dateString;
    }
  }

  updateLastUpdatedTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const updateElement = document.getElementById("update-time");
    if (updateElement) {
      updateElement.textContent = timeString;
    }
  }

  setupAutoTimeUpdate() {
    setInterval(() => {
      this.updateCurrentTime();
    }, 1000);
  }

  // ==================== DYNAMIC STYLES ====================
  injectDynamicStyles() {
    const styles = `
            /* Mobile Menu Styles */
            .mobile-menu {
                display: none;
                cursor: pointer;
                font-size: 1.5rem;
            }
            
            @media (max-width: 768px) {
                .mobile-menu {
                    display: block;
                }
                
                .nav-menu {
                    display: none;
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: linear-gradient(90deg, #1a73e8, #0d47a1);
                    flex-direction: column;
                    padding: 1rem;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                    z-index: 1000;
                }
                
                .nav-menu.active {
                    display: flex;
                    animation: slideDown 0.3s ease;
                }
                
                .nav-menu li {
                    width: 100%;
                }
                
                .nav-menu a {
                    padding: 1rem;
                    border-radius: 5px;
                    margin: 0.2rem 0;
                }
                
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            }
            
            /* Notification System */
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 10000;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                animation: slideIn 0.3s ease-out;
                max-width: 400px;
            }
            
            .notification.success {
                background: linear-gradient(135deg, #4CAF50, #2E7D32);
                border-left: 4px solid #2E7D32;
            }
            
            .notification.warning {
                background: linear-gradient(135deg, #FF9800, #EF6C00);
                border-left: 4px solid #EF6C00;
            }
            
            .notification.danger {
                background: linear-gradient(135deg, #F44336, #C62828);
                border-left: 4px solid #C62828;
            }
            
            .notification.info {
                background: linear-gradient(135deg, #2196F3, #0D47A1);
                border-left: 4px solid #0D47A1;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                margin-left: 10px;
                opacity: 0.8;
                transition: opacity 0.3s;
            }
            
            .notification-close:hover {
                opacity: 1;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            /* Status Badges */
            .status-badge {
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 0.85rem;
                font-weight: bold;
                display: inline-block;
            }
            
            .status-badge.good {
                background: #E8F5E9;
                color: #2E7D32;
                border: 1px solid #4CAF50;
            }
            
            .status-badge.warning {
                background: #FFF3E0;
                color: #EF6C00;
                border: 1px solid #FF9800;
            }
            
            .status-badge.danger {
                background: #FFEBEE;
                color: #C62828;
                border: 1px solid #F44336;
            }
            
            /* Status Indicators */
            .status-indicator {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                display: inline-block;
                margin-left: auto;
            }
            
            .status-indicator.good {
                background: #4CAF50;
                box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
            }
            
            .status-indicator.warning {
                background: #FF9800;
                box-shadow: 0 0 10px rgba(255, 152, 0, 0.5);
            }
            
            .status-indicator.danger {
                background: #F44336;
                box-shadow: 0 0 10px rgba(244, 67, 54, 0.5);
            }
            
            .status-indicator.normal {
                background: #2196F3;
                box-shadow: 0 0 10px rgba(33, 150, 243, 0.5);
            }
            
            /* System Status Cards */
            .system-card.online {
                border-left: 4px solid #4CAF50;
            }
            
            .system-card.offline {
                border-left: 4px solid #F44336;
            }
            
            .system-status-text {
                font-size: 0.9rem;
                font-weight: bold;
                margin-top: 0.5rem;
            }
            
            .system-status-text.online {
                color: #4CAF50;
            }
            
            .system-status-text.offline {
                color: #F44336;
            }
            
            /* Loading Animations */
            .fa-spinner {
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            /* Button States */
            button:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            
            /* Alert History */
            .alert-history-item {
                padding: 1rem;
                border-radius: 10px;
                margin-bottom: 1rem;
                animation: fadeIn 0.5s ease;
            }
            
            .alert-history-item.warning {
                background: #FFF3E0;
                border-left: 4px solid #FF9800;
            }
            
            .alert-history-item.normal {
                background: #E8F5E9;
                border-left: 4px solid #4CAF50;
            }
            
            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            /* Responsive Tables */
            @media (max-width: 768px) {
                .table-container {
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                }
                
                table {
                    font-size: 0.9rem;
                }
                
                table th, table td {
                    padding: 0.5rem;
                }
            }
        `;

    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.waterMonitoringSystem = new WaterMonitoringSystem();
});

// Export for module usage (if needed)
if (typeof module !== "undefined" && module.exports) {
  module.exports = WaterMonitoringSystem;
}
