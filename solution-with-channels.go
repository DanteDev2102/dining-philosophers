package main

import (
	"fmt"
	"math/rand"
	"sync"
	"time"
)

const numPhilosophers = 5

type Philosopher struct {
	id        int
	leftFork  chan struct{}
	rightFork chan struct{}
}

func (p Philosopher) dine(wg *sync.WaitGroup) {
	defer wg.Done()

	for i := 0; i < 3; i++ {
		fmt.Printf("Philosopher %d is THINKING.\n", p.id)
		time.Sleep(time.Duration(rand.Intn(100)) * time.Millisecond)

		firstFork, secondFork := p.leftFork, p.rightFork
		
		if p.id == numPhilosophers-1 {
			firstFork, secondFork = p.rightFork, p.leftFork
		}

		<-firstFork
		<-secondFork

		fmt.Printf("Philosopher %d is EATING.\n", p.id)
		time.Sleep(time.Duration(rand.Intn(100)) * time.Millisecond)

		secondFork <- struct{}{}
		firstFork <- struct{}{}
	}
	fmt.Printf("Philosopher %d has finished dining.\n", p.id)
}

func main() {
	rand.Seed(time.Now().UnixNano())

	var wg sync.WaitGroup
  
	forks := make([]chan struct{}, numPhilosophers)
	for i := 0; i < numPhilosophers; i++ {
		forks[i] = make(chan struct{}, 1)
		forks[i] <- struct{}{}
	}

	philosophers := make([]Philosopher, numPhilosophers)
	for i := 0; i < numPhilosophers; i++ {
		philosophers[i] = Philosopher{
			id:        i,
			leftFork:  forks[i],
			rightFork: forks[(i+1)%numPhilosophers],
		}
		
		wg.Add(1)
		go philosophers[i].dine(&wg)
	}

	wg.Wait()
	fmt.Println("All philosophers have finished. The table is empty.")
}
