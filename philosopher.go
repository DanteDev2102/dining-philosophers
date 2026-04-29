package main

type PhilosopherState int

const (
	Thinking PhilosopherState = iota
	Hungry
	Eating
)

func (s PhilosopherState) String() string {
	switch s {
	case Thinking:
		return "thinking"
	case Hungry:
		return "hungry"
	case Eating:
		return "eating"
	}
	return "thinking"
}

type Philosopher struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	FileName string `json:"fileName"`
	StateStr string `json:"stateStr"`
}

type SimulationState struct {
	Philosophers []Philosopher `json:"philosophers"`
	Forks        []int         `json:"forks"`
	Running      bool          `json:"running"`
}
