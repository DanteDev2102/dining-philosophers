package main

import (
	"context"
	"math/rand"
	"sync"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type fork chan struct{}

func newFork() fork {
	f := make(fork, 1)
	f <- struct{}{}
	return f
}

func (f fork) pickUp(ctx context.Context) bool {
	select {
	case <-f:
		return true
	case <-ctx.Done():
		return false
	}
}

func (f fork) putDown() { f <- struct{}{} }

var (
	philosopherNames = [5]string{
		"Sócrates",
		"Platón",
		"Descartes",
		"Aristóteles",
		"Pitágoras",
	}
	philosopherFiles = [5]string{
		"socrates",
		"platon",
		"descartes",
		"aristoteles",
		"pitagoras",
	}
)

type Simulation struct {
	appCtx  context.Context
	mu      sync.RWMutex
	states  [5]PhilosopherState
	forks   [5]fork
	inUse   [5]int
	cancel  context.CancelFunc
	running bool
}

func NewSimulation(ctx context.Context) *Simulation {
	s := &Simulation{appCtx: ctx}

	for i := range s.forks {
		s.forks[i] = newFork()
		s.states[i] = Thinking
		s.inUse[i] = -1
	}

	return s
}

func (s *Simulation) Start() {
	if s.running {
		return
	}

	ctx, cancel := context.WithCancel(s.appCtx)
	s.cancel = cancel
	s.running = true

	s.emitUpdate()

	for i := 0; i < 5; i++ {
		go s.loop(ctx, i)
	}
}

func (s *Simulation) Stop() {
	if s.cancel != nil {
		s.cancel()
		s.cancel = nil
	}

	time.Sleep(50 * time.Millisecond)
	s.mu.Lock()
	s.running = false

	for i := range s.states {
		s.states[i] = Thinking
		s.inUse[i] = -1
	}

	for i := range s.forks {
		s.forks[i] = newFork()
	}

	s.mu.Unlock()
	s.emitUpdate()
}

func (s *Simulation) IsRunning() bool { return s.running }

func (s *Simulation) loop(ctx context.Context, id int) {
	left, right := id, (id+4)%5
	first, second := left, right
	if first > second {
		first, second = second, first
	}

	for {
		s.setState(id, Thinking)
		s.emitUpdate()
		if !sleep(ctx, 3000+rand.Intn(4000)) {
			return
		}

		s.setState(id, Hungry)
		s.emitUpdate()

		if !sleep(ctx, 2500) {
			return
		}

		if !s.forks[first].pickUp(ctx) {
			return
		}
		s.setInUse(first, id)
		s.emitUpdate()

		if !sleep(ctx, 2500) {
			s.forks[first].putDown()
			s.setInUse(first, -1)
			s.emitUpdate()
			return
		}

		if !s.forks[second].pickUp(ctx) {
			s.forks[first].putDown()
			s.setInUse(first, -1)
			s.emitUpdate()
			return
		}
		s.setInUse(second, id)
		s.emitUpdate()

		if !sleep(ctx, 1000) {
			return
		}

		s.setState(id, Eating)
		s.emitUpdate()
		if !sleep(ctx, 4000+rand.Intn(3000)) {
			s.forks[first].putDown()
			s.forks[second].putDown()
			s.setInUse(first, -1)
			s.setInUse(second, -1)
			return
		}

		s.forks[first].putDown()
		s.setInUse(first, -1)
		s.emitUpdate()

		if !sleep(ctx, 1500) {
			s.forks[second].putDown()
			s.setInUse(second, -1)
			return
		}

		s.forks[second].putDown()
		s.setInUse(second, -1)
		s.emitUpdate()

		if !sleep(ctx, 1500) {
			return
		}
	}
}

func sleep(ctx context.Context, ms int) bool {
	select {
	case <-ctx.Done():
		return false
	case <-time.After(time.Duration(ms) * time.Millisecond):
		return true
	}
}

func (s *Simulation) setState(id int, state PhilosopherState) {
	s.mu.Lock()
	s.states[id] = state
	s.mu.Unlock()
}

func (s *Simulation) setInUse(id int, owner int) {
	s.mu.Lock()
	s.inUse[id] = owner
	s.mu.Unlock()
}

func (s *Simulation) snapshot() SimulationState {
	s.mu.RLock()
	defer s.mu.RUnlock()

	philosophers := make([]Philosopher, 5)
	for i := 0; i < 5; i++ {
		philosophers[i] = Philosopher{
			ID:       i,
			Name:     philosopherNames[i],
			FileName: philosopherFiles[i],
			StateStr: s.states[i].String(),
		}
	}

	forks := make([]int, 5)
	copy(forks, s.inUse[:])

	return SimulationState{
		Philosophers: philosophers,
		Forks:        forks,
		Running:      s.running,
	}
}

func (s *Simulation) emitUpdate() {
	runtime.EventsEmit(s.appCtx, "simulation:update", s.snapshot())
}

func (s *Simulation) GetState() SimulationState { return s.snapshot() }
