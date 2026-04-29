package main

import "context"

// App struct
type App struct {
	ctx        context.Context
	simulation *Simulation
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.simulation = NewSimulation(ctx)
}

// StartSimulation begins the dining philosophers simulation
func (a *App) StartSimulation() {
	a.simulation.Start()
}

// StopSimulation halts the dining philosophers simulation
func (a *App) StopSimulation() {
	a.simulation.Stop()
}

// GetSimulationState returns a snapshot of the current simulation
func (a *App) GetSimulationState() SimulationState {
	return a.simulation.GetState()
}

// IsRunning returns whether the simulation is currently active
func (a *App) IsRunning() bool {
	return a.simulation.IsRunning()
}
